(function () {
  angular.module('notinphillyServerApp')
    .service('mapService', ['$http', '$q', '$rootScope', 'APP_EVENTS', 'APP_CONSTS', function($http, $q, $rootScope, APP_EVENTS, APP_CONSTS) {
      var self = this;
      var deferredMap = $q.defer();

      var mapLayerGroup = L.layerGroup();
      var mapStreetLayer = undefined;
      var mapCallbacks = {
        neighborhoodMouseOverCallback : undefined,
        neighborhoodMouseOutCallback : undefined,
        neighborhoodMouseClickCallback : undefined,
        streetMouseOverCallback : undefined,
        streetMouseOutCallback: undefined,
        pinClickCallback: undefined
      };
      var mapControls = [];

      self.setMap = function(mapInstance) {
        deferredMap.resolve(mapInstance);
      };

      self.getMap = function() {
        return deferredMap.promise;
      };

      self.setMapCallbacks = function(callbacks) {
        mapCallbacks = callbacks;
      };

      self.resetSize = function()
      {
          deferredMap.promise.then(function(map) {
              map.invalidateSize();
          });
      }

      self.destroy = function()
      {
          deferredMap.promise.then(function(map) {
              map.remove();
          });
      }

      self.setNeighborhoodLayers = function() {
        deferredMap.promise.then(function(map) {
          $http.get("api/neighborhoods/getAllGeojson/").success(function(data, status) {
            mapLayerGroup.clearLayers();
            map.closePopup();
            setMapControls(map, false);

            var geoJsonLayer = L.geoJson(data, {
              onEachFeature: function (feature, layer){
                layer.setStyle(setNeighborhoodColor(feature));
                //setNeighborhoodLabel(feature, layer, map);
                layer.on({
                  mouseover: function(e) { highlightNeighborhood(e); mapCallbacks.neighborhoodMouseOverCallback(e); },
                  mouseout: function(e) { resetHighlightNeighborhood(e); mapCallbacks.neighborhoodMouseOutCallback(e); },
                  click: function(e) { onNeighborhoodLayerClick(e); mapCallbacks.neighborhoodMouseClickCallback(e);},
                });
              },
              style: {
                color: '#9A9B9C',
                weight: 2,
                fillOpacity: 0.4,
                fillColor: '#484848'
              }
            });

            map.setView(APP_CONSTS.MAP_CENTER, 13, { animate: false });
            mapLayerGroup.addLayer(geoJsonLayer);
            mapLayerGroup.addTo(map);
            mapStreetLayer = undefined;

            map.invalidateSize();
           });
        });
      };

      self.showStreetPopup = function(streetFeature) {
        deferredMap.promise.then(function(map) {
          var properties = streetFeature.properties;
          var geometry = streetFeature.geometry;

          var geoJsonLayer = L.geoJson(streetFeature);
          var layerBounds = geoJsonLayer.getBounds();
          var streetCenter = layerBounds.getCenter();

          openStreetLayerPopup(streetCenter, properties);
        });
      };

      self.addNeigborhoodStreets = function(neighborhoodId) {
        deferredMap.promise.then(function(map) {
          loadStreets(neighborhoodId, map);
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

        deferredMap.promise.then(function(map) {
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

        deferredMap.promise.then(function(map) {
          mapLayerGroup.clearLayers();
          map.closePopup();
          setMapControls(map, true);

          var LeafIcon = L.Icon.extend({
            options: {
              iconSize:     [32, 32], // size of the icon
              iconAnchor:   [16, 32], // point of the icon which will correspond to marker's location
              popupAnchor:  [16, 0] // point from which the popup should open relative to the iconAnchor
            }
          });

          if(addressLocation)
          {
            var addressIcon = new LeafIcon({iconUrl: 'public/img/address_house.png'});
            var addressMarker = L.marker(addressLocation, {icon: addressIcon});
            mapLayerGroup.addLayer(addressMarker);
            addressMarker.addTo(map);
          }
          else
          {
            var geoJsonLayer = L.geoJson(streets[0]);
            var layerBounds = geoJsonLayer.getBounds();
            addressLocation = layerBounds.getCenter();
          }

          map.setView(addressLocation, 17, { animate: false });

          var markerIcon = new LeafIcon({iconUrl: 'public/img/map_marker.png'});

          var streetLayer = createStreetLayer(streets);
          mapStreetLayer = streetLayer;
          mapLayerGroup.addLayer(streetLayer);
          streetLayer.addTo(map);

          for(var i = 0; i < streets.length; i++)
          {
            var street = streets[i];
            var streetMarker = L.marker(street.streetCenter, {icon: markerIcon});
            streetMarker.street = street;
            streetMarker.on({
            click: function(e) { mapCallbacks.pinClickCallback(e); }
            });
            mapLayerGroup.addLayer(streetMarker);
            streetMarker.addTo(map);
          }

          map.invalidateSize();
        });
      }

      self.goToStreet = function(streetId) {
        deferredMap.promise.then(function(map) {
          $http.get("api/streets/" + streetId).success(function(streetData, status) {
            $http.get("api/neighborhoods/" + streetData.neighborhood).success(function(neighborhooData, status) {
              var start = L.latLng(streetData.geodata.geometry.coordinates[0][1], streetData.geodata.geometry.coordinates[0][0]);
              var end = L.latLng(streetData.geodata.geometry.coordinates[1][1], streetData.geodata.geometry.coordinates[1][0]);
              var streetBounds = new L.LatLngBounds(start, end);

              loadStreets(streetData.neighborhood, map).then(function(layers) {
                var foundLayer = layers.filter(function(layer) {
                  return layer.feature.properties.id === streetData._id;
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
        deferredMap.promise.then(function(map) {
          var layers = mapStreetLayer.getLayers();
          var foundLayer = layers.filter(function(layer) {
            return layer.feature.properties.id === streetId;
          })[0];

          var geoJsonLayer = L.geoJson(foundLayer.feature);
          var layerBounds = geoJsonLayer.getBounds();
          var streetCenter = layerBounds.getCenter();

          map.setView(streetCenter, 17, { animate: false });

          openStreetLayerPopup(streetCenter, foundLayer.feature.properties);
        });
      }

      self.zoomIn = function(zoomDelta) {
        deferredMap.promise.then(function(map) {
          map.zoomIn(zoomDelta);
        });
      };

      self.zoomOut = function(zoomDelta) {
        deferredMap.promise.then(function(map) {
          map.zoomOut(zoomDelta);
        });
      };

      var loadStreets = function(neighborhoodId, map) {
        var deferredSetup = $q.defer();

        deferredMap.promise.then(function(map) {
          mapLayerGroup.clearLayers();
          map.closePopup();
          setMapControls(map, true);

          $http.get("api/streets/byparentgeo/" + neighborhoodId).success(function(data, status) {
            var streetLayer = createStreetLayer(data);

            mapLayerGroup.addLayer(streetLayer);
            mapStreetLayer = streetLayer;
            streetLayer.addTo(map);

            deferredSetup.resolve(streetLayer.getLayers());
          }, function(err) {
            deferredSetup.reject(err);
          });
        });

        return deferredSetup.promise;
      };

      var setMapControls = function(mapInstance, isStreetLevel)
      {
        for(var i = 0; i < mapControls.length; i++)
        {
          var control = mapControls[i];
          mapInstance.removeControl(control);
        }

        mapControls = [];
        if(isStreetLevel)
        {
          var viewNeigborhoodsControl = L.Control.extend({
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
              var container = L.DomUtil.create('div', 'map-control');
              container.innerHTML = '<a class="map-control-text"><i class="fa fa-map-o"></i> Neighborhoods</a>';

              container.onclick = function(){
                self.setNeighborhoodLayers();
              }
              return container;
            }
          });
          viewNeigborhoodsControl = new viewNeigborhoodsControl();
          mapInstance.addControl(viewNeigborhoodsControl);
          mapControls.push(viewNeigborhoodsControl);
        }

        var zoomControl = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div');
            container.innerHTML = '<div class="map-control"><a class="map-control-text"><i class="fa fa-2x fa-search-plus"></i></a></div><div class="map-control"><a class="map-control-text"><i class="fa fa-2x fa-search-minus"></i></a></div>';
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
        mapControls.push(zoomControl);
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
          street["streetMapPreview"] = "https://api.mapbox.com/styles/v1/yurykorzun/cimv1ezcc00sqb8m7z8e3yeiz/static/" + streetCenter.lng + "," + streetCenter.lat + ",15/120x95?logo=false&access_token=pk.eyJ1IjoieXVyeWtvcnp1biIsImEiOiJjaWY2eTN2aHMwc3VncnptM3QxMzU3d3hxIn0.Mt0JldEMvvTdWW4GW2RSlQ";
        }

        return streets;
      }

      var createStreetLayer = function(streets) {
        var geoJsonLayer = L.geoJson(streets, {
          onEachFeature : function (feature, layer){
            layer.setStyle(getStreetStyle(feature));
            //setStreetLabel(feature, layer);
            layer.on({
              mouseover: function(e) { mapCallbacks.streetMouseOverCallback(e); },
              mouseout: function(e) { mapCallbacks.streetMouseOutCallback(e); },
              click: function(e) { mapCallbacks.streetClickCallback(e); }
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
          deferredMap.promise.then(function(map) {
            var triggeredFeature = e.target.feature;
            var properties = triggeredFeature.properties;
            var layerBounds = e.layer.getBounds();

            var nhoodCenter = layerBounds.getCenter();
            nhoodCenter.lng = nhoodCenter.lng - 0.001;
            map.setView( nhoodCenter, 16, { animate: true });
            map.invalidateSize();

            loadStreets(properties.id, map);
          });
        }
      };

      var openStreetLayerPopup = function(streetLongLat, properties) {
        deferredMap.promise.then(function(map) {
            //https://maps.googleapis.com/maps/api/streetview?size=220x100&location=39.953798462302345,-75.19377532873054&fov=70&heading=170&pitch=10
            var imageSrc = "https://maps.googleapis.com/maps/api/streetview?size=270x120&location=" +  streetLongLat.lat + "," + streetLongLat.lng  + "&key=AIzaSyARRi6qzN2f_jQpkH_2nedCFpTY2ehOy4A";

            properties.imageSrc = imageSrc;
            var popup = L.popup({
              keepInView: true,
              minWidth: 240,
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
          if (properties.totalAdoptedStreets == 0) {
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
