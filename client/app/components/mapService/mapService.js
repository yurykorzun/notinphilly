(function () {
  angular.module('notinphillyServerApp')
    .service('mapService', ['$http', '$q', '$rootScope', 'APP_EVENTS', 'APP_CONSTS', function($http, $q, $rootScope, APP_EVENTS, APP_CONSTS) {
      var self = this;
      var _deferredMap = $q.defer();

      var _mapLayerGroup = L.layerGroup();
      var _mapLabelsLayer = L.layerGroup();
      var _mapStreetLayer = undefined;

      var _mapCallbacks = {
        neighborhoodMouseOverCallback : undefined,
        neighborhoodMouseOutCallback : undefined,
        neighborhoodMouseClickCallback : undefined,
        streetMouseOverCallback : undefined,
        streetMouseOutCallback: undefined,
        pinClickCallback: undefined
      };
      var _mapControls = [];

      self.setMap = function(mapInstance) {
        _deferredMap.resolve(mapInstance);
      };

      self.getMap = function() {
        return _deferredMap.promise;
      };

      self.setMapCallbacks = function(callbacks) {
        _mapCallbacks = callbacks;
      };

      self.resetSize = function()
      {
          _deferredMap.promise.then(function(map) {
              map.invalidateSize();
          });
      }

      self.destroy = function()
      {
          _deferredMap.promise.then(function(map) {
              map.remove();
          });
      }

      self.setNeighborhoodLayers = function() {
        _deferredMap.promise.then(function(map) {
          $http.get("api/neighborhoods/getAllGeojson/").success(function(data, status) {
            _mapLayerGroup.clearLayers();
            _mapLabelsLayer.clearLayers();

            map.closePopup();
            createNeighborhoodControls(map);

            var geoJsonLayer = L.geoJson(data, {
              onEachFeature: function (feature, layer){
                layer.setStyle(setNeighborhoodColor(feature));
                setNeighborhoodLabel(feature, layer, map);
                layer.on({
                  mouseover: function(e) { highlightNeighborhood(e); _mapCallbacks.neighborhoodMouseOverCallback(e); },
                  mouseout: function(e) { resetHighlightNeighborhood(e); _mapCallbacks.neighborhoodMouseOutCallback(e); },
                  click: function(e) { onNeighborhoodLayerClick(e); _mapCallbacks.neighborhoodMouseClickCallback(e);},
                });
              },
              style: {
                color: '#9A9B9C',
                weight: 2,
                fillOpacity: 0.4,
                fillColor: '#484848'
              }
            });

            var mapCenter = getMapCenter().then(function(mapCenter){
               map.setView(mapCenter, 13, { animate: false });
              _mapLayerGroup.addLayer(geoJsonLayer);
              _mapLayerGroup.addTo(map);
              _mapStreetLayer = undefined;

              map.invalidateSize();
            });
           });
        });
      };

      self.showStreetPopup = function(streetFeature) {
        _deferredMap.promise.then(function(map) {
          var properties = streetFeature.properties;
          var geometry = streetFeature.geometry;

          var geoJsonLayer = L.geoJson(streetFeature);
          var layerBounds = geoJsonLayer.getBounds();
          var streetCenter = layerBounds.getCenter();

          openStreetLayerPopup(streetCenter, properties);
        });
      };

      
      self.addAllStreets = function() {
        $http.get("api/streets/getAllGeojson").success(function(streetData, status) {
          _deferredMap.promise.then(function(map) {
              createStreetControls(map);

              _mapLayerGroup.clearLayers();
              _mapLabelsLayer.clearLayers();

              var streetLayer = createStreetLayer(streetData);

              _mapLayerGroup.addLayer(streetLayer);
              _mapStreetLayer = streetLayer;
              streetLayer.addTo(map);
            });
        });
      };

      self.addNeigborhoodStreets = function(location) {
        $http.post('api/neighborhoods/byloc', location).success(function(neighborhooData, status) {
          _deferredMap.promise.then(function(map) {
            loadStreets(neighborhooData, map);
          });
        });
      };

      self.getStreetsForCurrentUser = function()
      {
        var deferredStreets = $q.defer();

        $http.get("api/streets/current/").success(function(result, status) {
          var foundStreets = result;
          foundStreets = convertStreets(foundStreets);

          deferredStreets.resolve(result);
        }, function(err) {
            deferredStreets.reject(err);
        });

        return deferredStreets.promise;
      }

      self.findStreetsNear = function(location) {
        var deferredStreets = $q.defer();

        _deferredMap.promise.then(function(map) {
          $http.post('api/streets/byloc', location).then(function(result) {
            var foundStreets = result.data;
            foundStreets = convertStreets(foundStreets);

            map.invalidateSize();
            deferredStreets.resolve(result.data);
          }, function(err) {
            deferredStreets.reject(err);
          });
        });

        return deferredStreets.promise;
      }

      self.showStreets = function(streets, addressLocation) {
        if(streets.length == 0) return;

        _deferredMap.promise.then(function(map) {
          _mapLayerGroup.clearLayers();
          _mapLabelsLayer.clearLayers();

          map.closePopup();
          createStreetControls(map);

          var LeafIcon = L.Icon.extend({
            options: {
              iconSize:     [40, 40], // size of the icon
              iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
              popupAnchor:  [20, 0] // point from which the popup should open relative to the iconAnchor
            }
          });

          if (addressLocation)
          {
            var addressIcon = new LeafIcon({iconUrl: 'public/img/home.png'});
            var addressMarker = L.marker(addressLocation, {icon: addressIcon});
            _mapLayerGroup.addLayer(addressMarker);
            addressMarker.addTo(map);

            map.setView(addressLocation, 17, { animate: false });
          }
          else
          {
            var geoJsonLayer = L.geoJson(streets[0]);
            var layerBounds = geoJsonLayer.getBounds();
            addressLocation = layerBounds.getCenter();

            map.setView(addressLocation, 17, { animate: false });
          }

          var markerIcon = new LeafIcon({iconUrl: 'public/img/broom.png'});

          var streetLayer = createStreetLayer(streets);
          _mapStreetLayer = streetLayer;
          _mapLayerGroup.addLayer(streetLayer);
          streetLayer.addTo(map);

          for(var i = 0; i < streets.length; i++)
          {
            var street = streets[i];
            var streetMarker = L.marker(street.streetCenter, {icon: markerIcon});
            streetMarker.street = street;
            streetMarker.on({
              click: function(e) { _mapCallbacks.pinClickCallback(e); }
            });
            _mapLayerGroup.addLayer(streetMarker);
            streetMarker.addTo(map);
          }

          map.invalidateSize();
        });
      }

      self.goToStreet = function(streetId) {
        _deferredMap.promise.then(function(map) {
          $http.get("api/streets/" + streetId).success(function(streetData, status) {
            $http.get("api/neighborhoods/" + streetData.neighborhoods[0]).success(function(neighborhooData, status) {
              var start = L.latLng(streetData.geometry.coordinates[0][1], streetData.geometry.coordinates[0][0]);
              var end = L.latLng(streetData.geometry.coordinates[1][1], streetData.geometry.coordinates[1][0]);
              var streetBounds = new L.LatLngBounds(start, end);

              loadStreets(neighborhooData, map).then(function(layers) {
                var foundLayer = layers.filter(function(layer) {
                  return layer.feature.properties._id === streetData._id;
                })[0];

                var geoJsonLayer = L.geoJson(foundLayer.feature);
                var layerBounds = geoJsonLayer.getBounds();
                var streetCenter = layerBounds.getCenter();

                map.setView(streetCenter, 16, { animate: false });

                openStreetLayerPopup(streetCenter, foundLayer.feature.properties);
              });
            });
          });
        });
      };

      self.selectStreet = function(streetId) {
        _deferredMap.promise.then(function(map) {
          var layers = _mapStreetLayer.getLayers();
          var foundLayer = layers.filter(function(layer) {
            return layer.feature.properties._id === streetId;
          })[0];

          var geoJsonLayer = L.geoJson(foundLayer.feature);
          var layerBounds = geoJsonLayer.getBounds();
          var streetCenter = layerBounds.getCenter();

          map.setView(streetCenter, 17, { animate: false });

          openStreetLayerPopup(streetCenter, foundLayer.feature.properties);
        });
      }

      self.zoomIn = function(zoomDelta) {
        _deferredMap.promise.then(function(map) {
          map.zoomIn(zoomDelta);
        });
      };

      self.zoomOut = function(zoomDelta) {
        _deferredMap.promise.then(function(map) {
          map.zoomOut(zoomDelta);
        });
      };

      self.zoomIn = function(zoomDelta) {
        _deferredMap.promise.then(function(map) {
          map.zoomIn(zoomDelta);
        });
      };

      self.showLabels = function() {
        _deferredMap.promise.then(function(map) {
          if (!map.hasLayer(_mapLabelsLayer))
          {
            _mapLabelsLayer.addTo(map);
          }
        });
      };

      self.hideLabels = function() {
        _deferredMap.promise.then(function(map) {
          if (map.hasLayer(_mapLabelsLayer))
          {
            map.removeLayer(_mapLabelsLayer);
          }
        });
      };

      var getMapCenter = function() {
        var defferedCenter = $q.defer();

        $http.get("api/city/getGeoJSON").success(function(cityData, status) {
          var geoJsonLayer = L.geoJson(cityData);
          var layerBounds = geoJsonLayer.getBounds();
          var mapCenter = layerBounds.getCenter();

          defferedCenter.resolve(mapCenter);
        }, function(err) {
          defferedCenter.reject(err);
        });

        return defferedCenter.promise;
      };

      var setNeighborhoodLabel = function(feature, layer, map)
      {
        var layerBounds = layer.getBounds();
        var center = layerBounds.getCenter();

        var myIcon = L.divIcon({html: '<div><h5>' + feature.properties.name + '<h5></div>', iconAnchor: [20, 15], className: 'map-label'});
        var tooltipMarker = L.marker(center, {icon: myIcon, riseOnHover: true});
        tooltipMarker.addTo(_mapLabelsLayer);
      }

      var loadStreets = function(neighborhooData, map) {
        var deferredSetup = $q.defer();

        _deferredMap.promise.then(function(map) {
          _mapLayerGroup.clearLayers();
          _mapLabelsLayer.clearLayers();

          map.closePopup();
          createStreetControls(map, neighborhooData);

          $http.get("api/streets/byparentgeo/" + neighborhooData._id).success(function(data, status) {
            var streetLayer = createStreetLayer(data);

            _mapLayerGroup.addLayer(streetLayer);
            _mapStreetLayer = streetLayer;
            streetLayer.addTo(map);

            deferredSetup.resolve(streetLayer.getLayers());
          }, function(err) {
            deferredSetup.reject(err);
          });
        });

        return deferredSetup.promise;
      };

      var createNeighborhoodControls = function(mapInstance, neighborhooData) 
      {
        clearMapControls(mapInstance);
        createZoomControls(mapInstance);
        if (neighborhooData)
        {
          createNeighborhoodDetails(mapInstance, neighborhooData);
        }
      }

      var createStreetControls = function(mapInstance, neighborhooData) 
      {
        clearMapControls(mapInstance);
        createZoomControls(mapInstance);
        createNavigationControls(mapInstance);
        if (neighborhooData)
        {
          createNeighborhoodDetails(mapInstance, neighborhooData);
        }
      }

      var clearMapControls = function(mapInstance) {
        for (var i = 0; i < _mapControls.length; i++)
        {
          var control = _mapControls[i];
          mapInstance.removeControl(control);
        }

        _mapControls = [];
      }

      var createNavigationControls = function(mapInstance) {
        var viewNeigborhoodsControl = L.Control.extend({
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
              var container = L.DomUtil.create('div', 'map-control');
              container.innerHTML = '<a class="map-control-text"><i class="fa fa-map-o"></i> View Neighborhoods</a>';

              container.onclick = function(){
                self.setNeighborhoodLayers();
              }
              return container;
            }
          });

          viewNeigborhoodsControl = new viewNeigborhoodsControl();
          mapInstance.addControl(viewNeigborhoodsControl);
          _mapControls.push(viewNeigborhoodsControl);
      }

      var createNeighborhoodDetails = function(mapInstance, neighborhooData) {
          var neighborhoodDetails = L.Control.extend({
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
              var detailsContainer = L.DomUtil.create('div', 'map-control');
              detailsContainer.innerHTML = '<div class="hidden-xs"><div><h5>' + neighborhooData.name + '</h5></div>' 
                                            + '<div>Total streets: ' + neighborhooData.totalStreets + '</h5></div>' 
                                            + '<div>Participating streets: ' + neighborhooData.totalAdoptedStreets + '</h5></div></div>' ;
              return detailsContainer;
            }
          });
          neighborhoodDetails = new neighborhoodDetails();
          mapInstance.addControl(neighborhoodDetails);
          _mapControls.push(neighborhoodDetails);
      }

      var createZoomControls = function(mapInstance) {
        var zoomControl = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div');
            container.innerHTML = '<div class="map-control map-control-inline"><a class="map-control-text"><i class="fa fa-2x fa-search-plus"></i></a></div><div class="map-control map-control-inline"><a class="map-control-text"><i class="fa fa-2x fa-search-minus"></i></a></div>';
            container.children[0].onclick = function(){
              self.zoomIn(1);
            }
            container.children[1].onclick = function(){
              self.zoomOut(1);
            }
            return container;
          }
        });
        zoomControl = new zoomControl();
        mapInstance.addControl(zoomControl);
        _mapControls.push(zoomControl);
      }

      var convertStreets = function(streets)
      {
        for(var i = 0; i < streets.length; i++)
        {
          var street = streets[i];
          var geoJsonLayer = L.geoJson(street);
          var layerBounds = geoJsonLayer.getBounds();
          var streetCenter = layerBounds.getCenter();

          street["streetCenter"] = streetCenter;
          street["streetMapPreview"] = "/api/external/mapbox-staticmap/" + streetCenter.lng + "/" + streetCenter.lat;
        }

        return streets;
      }

      var createStreetLayer = function(streets) {
        var geoJsonLayer = L.geoJson(streets, {
          onEachFeature : function (feature, layer){
            layer.setStyle(getStreetStyle(feature));
            //setStreetLabel(feature, layer);
            layer.on({
              mouseover: function(e) { _mapCallbacks.streetMouseOverCallback(e); },
              mouseout: function(e) { _mapCallbacks.streetMouseOutCallback(e); },
              click: function(e) { _mapCallbacks.streetClickCallback(e); }
            });
          },
          style: {
            color: '#484848',
            weight: 15,
            opacity: 0.2
          }
        });

        return geoJsonLayer;
      };

      var onNeighborhoodLayerClick = function(e) {
        if (e.target.feature) {
          _deferredMap.promise.then(function(map) {
            var triggeredFeature = e.target.feature;
            var properties = triggeredFeature.properties;
            var layerBounds = e.target.getBounds();

            var nhoodCenter = layerBounds.getCenter();
            nhoodCenter.lng = nhoodCenter.lng - 0.001;
            map.setView( nhoodCenter, 16, { animate: true });
            map.invalidateSize();

            loadStreets(properties, map);
          });
        }
      };

      var openStreetLayerPopup = function(streetLongLat, properties) {
        _deferredMap.promise.then(function(map) {
            var imageSrc = "/api/external/google-streetview-api/" + streetLongLat.lat + "/" + streetLongLat.lng;

            properties.imageSrc = imageSrc;
            var popup = L.popup({
              keepInView: true,
              minWidth: 320,
              autoPan: false,
              properties: properties
            });
            popup.setLatLng(streetLongLat);

            map.panTo(streetLongLat);

            $http.get('app/map/street-popup-template.html').then(function(response) {
              var rawHtml = response.data;
              popup.setContent(rawHtml);
              popup.openOn(map);
            });
        });
      };

      var getStreetStyle = function(feature) {
        if(feature.properties.totalAdopters > 0) {
          return {
            color: '#26A053',
            weight: 15,
            opacity: 0.4
          };
        }
      };

      var setNeighborhoodColor = function (feature) {
        var properties = feature.properties;

        if (!properties.active) {
          return {
            color: '#606264',
            weight: 2,
            fillColor: '#484848',
            fillOpacity: 0.4
          };
        } else {
          if (properties.totalAdoptedStreets === 0) {
            return {
              color: '#606264',
              weight: 2,
              fillColor: '#49586B',
              fillOpacity: 0.3
            };
          } else if (properties.totalAdoptedStreets > 0 && properties.percentageAdoptedStreets < 10) {
              return {
                color: '#4F5154',
                weight: 2,
                fillColor: '#6AC48E',
                fillOpacity: 0.3
              };
            } else if (properties.percentageAdoptedStreets > 10 && properties.percentageAdoptedStreets < 25) {
              return {
                color: '#4F5154',
                weight: 2,
                fillColor: '#26A053',
                fillOpacity: 0.3
              };
            } else {
              return {
                  color: '#606264',
                  weight: 2,
                  fillColor: '#2E8E52',
                  fillOpacity: 0.3
                };
             }
         }
      };

      var highlightNeighborhood = function(e) {
        var layer = e.target;
        var properties = layer.feature.properties;

        _deferredMap.promise.then(function(map) {
          createNeighborhoodControls(map, properties);
        });

        if(properties.active) {
          layer.setStyle({
            weight: 7,
            fillOpacity: 0.5,
            color: '#666'
          });

          if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
          }
        }
      };

      var resetHighlightNeighborhood = function(e) {
        var layer = e.target;
        var properties = layer.feature.properties;

        _deferredMap.promise.then(function(map) {
          clearMapControls(map);
          createZoomControls(map);
        });

        if(properties.active) {
          layer.setStyle({
            color: '#606264',
            fillOpacity: 0.3,
            weight: 2
          });
        }
      };
  }]);
})();
