(function () {
  angular.module('notinphillyServerApp')
    .service('mapService', ['$http', '$q', '$rootScope', 'APP_EVENTS', 'APP_CONSTS', function($http, $q, $rootScope, APP_EVENTS, APP_CONSTS) {
      var self = this;
      var _deferredMap = $q.defer();
      var _mapLayerGroup = L.layerGroup();
      var _mapMarkerGroup = L.layerGroup();      
      var _mapStreetLayer = undefined; 
      var _mapInstance = undefined;
      var _lastCalledFunction = undefined;
      
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
        _mapInstance = mapInstance;
        _deferredMap.resolve(mapInstance);
      };

      self.removeMap = function()
      {
        _lastCalledFunction = undefined;        
        if (_mapInstance) _mapInstance.remove();
        _mapInstance = undefined;
        _deferredMap = $q.defer();
      }

      self.getMap = function() {
        return _deferredMap.promise;
      };

      self.hasMap = function() {
        return _cityMapInstance != undefined;
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

      self.showNeighborhoodLayers = function() {
        _lastCalledFunction = function() {
          self.showNeighborhoodLayers();
        };

        _deferredMap.promise.then(function(map) {
          $http.get("api/neighborhoods/getAllGeojson/").success(function(data, status) {
            setMapLayer(map);

            map.closePopup();
            createNeighborhoodControls(map);

            var geoJsonLayer = L.geoJson(data, {
              onEachFeature: function (feature, layer){
                layer.setStyle(setNeighborhoodColor(feature));
                layer.on({
                  mouseover: function(e) { highlightNeighborhood(e); _mapCallbacks.neighborhoodMouseOverCallback(e); },
                  mouseout: function(e) { resetHighlightNeighborhood(e); _mapCallbacks.neighborhoodMouseOutCallback(e); },
                  click: function(e) { onNeighborhoodLayerClick(e); _mapCallbacks.neighborhoodMouseClickCallback(e);},
                });

                setNeighborhoodIcon(layer, feature, map);
              },
              style: {
                color: '#9A9B9C',
                weight: 2,
                fillOpacity: 0.4,
                fillColor: '#484848'
              }
            });

            _mapLayerGroup.addLayer(geoJsonLayer);
            _mapStreetLayer = undefined;

            var mapCenter = getMapCenter().then(function(mapCenter){
              map.setView(mapCenter, 13, { animate: false });
              map.invalidateSize();
            });
           });
        });
      };

      self.showNeigborhoodStreets = function(location) {
        _lastCalledFunction = function() {
          self.showNeigborhoodStreets(location);
         };
        
        $http.post('api/neighborhoods/byloc', location).success(function(neighborhooData, status) {
          _deferredMap.promise.then(function(map) {
            loadStreets(neighborhooData, map);

            createStreetControls(map, false, neighborhooData);
          });
        });
      };

      self.showNeigborhoodStreetsByLocation = function() {
        _lastCalledFunction = function() {
          self.showNeigborhoodStreetsByLocation();
        };

        _deferredMap.promise.then(function(map) {
          var mapCenterLocation = map.getCenter();
          $http.post('api/neighborhoods/byloc', mapCenterLocation).success(function(neighborhooData, status) {
            _deferredMap.promise.then(function(map) {
              loadStreets(neighborhooData, map);

              createStreetControls(map, false, neighborhooData);
            });
          });
        });
      };

      self.showNeigborhoodStreetsById = function(neighborhoodId) {
        _lastCalledFunction = function() {
          self.showNeigborhoodStreetsById(neighborhoodId);
        };

        _deferredMap.promise.then(function(map) {
          setMapLayer(map);

          map.closePopup();

          $http.get("api/streets/byparentgeo/" + neighborhoodId).success(function(streets, status) {
            setStreetViewSrc(streets);
            var streetLayer = createStreetLayer(streets);
            addAdoptedStreetMarkers(streets);

            _mapLayerGroup.addLayer(streetLayer);
            _mapStreetLayer = streetLayer;

            var layerBounds = _mapStreetLayer.getBounds();
            var streetCenter = layerBounds.getCenter();

            createStreetControls(map, false);
            
            map.setView(streetCenter, 17, { animate: false });
          }, function(err) {
            
          });
        });
      };

      self.showAllStreets = function() {
        $http.get("api/streets/getAllGeojson").success(function(streetData, status) {
          _deferredMap.promise.then(function(map) {
              setMapLayer(map);
              createStreetControls(map, false);

              var streetLayer = createStreetLayer(streetData);

              _mapLayerGroup.addLayer(streetLayer);
              _mapStreetLayer = streetLayer;
            });
        });
      };

      self.showUserStreets = function()
      {
        _lastCalledFunction = function() {
          self.showUserStreets();
        };

        var deferredStreets = $q.defer();

        _deferredMap.promise.then(function(map) {
          $http.get('api/streets/currentGeoJSON').then(function(result) {
            var foundStreets = result.data;
            foundStreets = setStreetViewSrc(foundStreets);

            showStreets(map, foundStreets);
            createLocationControls(map, true);
            
            deferredStreets.resolve(foundStreets);
          }, 
          function(err) {
            deferredStreets.reject(err);
          }); 
        });

        return deferredStreets.promise;       
      }

      self.showCurrentUserStreetsNear = function() {
        _lastCalledFunction = function() {
          self.showCurrentUserStreetsNear();
        };

        var deferredStreets = $q.defer();
        
        _deferredMap.promise.then(function(map) {
          $http.get('api/streets/currentLocationGeoJSON').then(function(result) {
            var foundStreets = result.data.streets;
            foundStreets = setStreetViewSrc(foundStreets);

            showStreets(map, foundStreets, result.data.location);
            map.invalidateSize();

            createLocationControls(map, true);

            deferredStreets.resolve(foundStreets);
          }, function(err) {
            deferredStreets.reject(err);
          });
        });

        return deferredStreets.promise;
      }

      self.showStreets = function(streets, addressLocation) {
        _lastCalledFunction = function() {
          self.showStreets(streets, addressLocation);
        };

        var deferredStreets = $q.defer();
        
        streets = setStreetViewSrc(streets);

        _deferredMap.promise.then(function(map) {
          showStreets(map, streets, addressLocation);

          createLocationControls(map, true);
          
          deferredStreets.resolve(foundStreets);
        });

        return deferredStreets.promise;
      }

      self.showStreetsNear = function(location) {
        _lastCalledFunction = function() {
          self.showStreetsNear(location);
        };

        var deferredStreets = $q.defer();
        
        _deferredMap.promise.then(function(map) {
          $http.post('api/streets/byLocationGeoJSON', location).then(function(result) {
            var foundStreets = result.data;
            foundStreets = setStreetViewSrc(foundStreets);

            showStreets(map, foundStreets, location);
            createLocationControls(map, true);

            map.invalidateSize();
            
            deferredStreets.resolve(foundStreets);
          }, function(err) {
            deferredStreets.reject(err);
          });
        });

        return deferredStreets.promise;
      }

      self.getCurrentUserStreets = function()
      {
        var deferredStreets = $q.defer();

        $http.get("api/streets/current/").success(function(result, status) {
          var foundStreets = result;
          foundStreets = setStreetViewSrc(foundStreets);

          deferredStreets.resolve(foundStreets);
        }, function(err) {
            deferredStreets.reject(err);
        });

        return deferredStreets.promise;
      }

      self.setCalendarEvents = function() {
          _deferredMap.promise.then(function(map) {
            $http.get("api/events/google").success(function(eventData, status) {
              if (eventData && eventData.length > 0)
              {
                for (var eventIndex=0; eventIndex < eventData.length; eventIndex++)
                {
                  var event = eventData[eventIndex];

                  if (!event.location) continue;
                  
                  var eventLocation = event.location;
                  var eventDate = new Date(event.start.dateTime);
                  
                  var marker = L.marker([eventLocation.latitude, eventLocation.longitude]).addTo(map);
                  marker.bindPopup("<b>"+ event.summary + "</b><p>" + eventLocation.formattedAddress + "</p><p>" + eventDate.toDateString() + "</p><p><a href='" + event.htmlLink + "' target='_blank'>View more</a></p>");
                }
              }
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

      self.getCurrentUserStreetsGeoJSON = function()
      {
        var deferredStreets = $q.defer();

        $http.get("api/streets/currentGeoJSON").success(function(result, status) {
          var foundStreets = result;
          foundStreets = setStreetViewSrc(foundStreets);

          deferredStreets.resolve(foundStreets);
        }, function(err) {
            deferredStreets.reject(err);
        });

        return deferredStreets.promise;
      }

      self.findStreetsNear = function(location) {
        _lastCalledFunction = function() {
          self.findStreetsNear();
        };

        var deferredStreets = $q.defer();

        $http.post('api/streets/byLocation', location).then(function(result) {
          var foundStreets = result.data;
          foundStreets = setStreetViewSrc(foundStreets);

          deferredStreets.resolve(foundStreets);
        }, function(err) {
          deferredStreets.reject(err);
        });

        return deferredStreets.promise;
      }

      self.findStreetsNearGeoJSON = function(location) {
        _lastCalledFunction = function() {
          self.findStreetsNearGeoJSON(location);
        };

        var deferredStreets = $q.defer();

        $http.post('api/streets/byLocationGeoJSON', location).then(function(result) {
          var foundStreets = result.data;
          foundStreets = setStreetViewSrc(foundStreets);

          deferredStreets.resolve(result.data);
        }, function(err) {
          deferredStreets.reject(err);
        });

        return deferredStreets.promise;
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

      self.adoptStreet = function(streetId) {
        var deferredStreets = $q.defer();

        $http.get("api/streets/adopt/" + streetId).then(function(response) {
          _deferredMap.promise.then(function(map) {
            reloadLastCalled();

            deferredStreets.resolve(response);
          });
        }, 
        function(error) {
          deferredStreets.resolve(error);
        });

        return deferredStreets.promise;        
      }

      self.leaveStreet = function(streetId) {
        var deferredStreets = $q.defer();
        
        $http.get("api/streets/leave/" + streetId).then(function(response) {
          _deferredMap.promise.then(function(map) {
            reloadLastCalled();
            
            deferredStreets.resolve(response);
          });
        }, 
        function(error) {
          deferredStreets.resolve(error);
        });

        return deferredStreets.promise;        
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

      var setMapLayer = function(map) {
        if (!map.hasLayer(_mapLayerGroup))
        {
          map.addLayer(_mapLayerGroup);
        }
        if (!map.hasLayer(_mapMarkerGroup))
        {
          map.addLayer(_mapMarkerGroup);
        }
        _mapLayerGroup.clearLayers();
        _mapMarkerGroup.clearLayers();        
      }

      var getMapCenter = function() {
        var defferedCenter = $q.defer();

        $http.get("api/city/getGeoJSON").success(function(cityData, status) {
          var geoJsonLayer = L.geoJson(cityData);
          var layerBounds = geoJsonLayer.getBounds();
          var mapCenter = cityData.properties.center ? cityData.properties.center : layerBounds.getCenter();

          defferedCenter.resolve(mapCenter);
        }, function(err) {
          defferedCenter.reject(err);
        });

        return defferedCenter.promise;
      };

      var showStreets = function(map, streets, addressLocation) {
        if(streets.length == 0) return;

        setMapLayer(map);

        map.closePopup();

        var LeafIcon = L.Icon.extend({
          options: {
            iconSize:     [40, 40], // size of the icon
            iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
            popupAnchor:  [20, 0] // point from which the popup should open relative to the iconAnchor
          }
        });

        addAllStreetMarkers(streets);
        
        var streetLayer = createStreetLayer(streets);
        _mapStreetLayer = streetLayer;
        _mapLayerGroup.addLayer(streetLayer);

        if (addressLocation)
        {
          var addressIcon = new LeafIcon({iconUrl: 'public/img/home.png'});
          var addressMarker = L.marker(addressLocation, {icon: addressIcon});
          _mapLayerGroup.addLayer(addressMarker);
          map.setView(addressLocation, 17, { animate: false });            
        }
        else
        {
          var layerBounds = _mapStreetLayer.getBounds();
          addressLocation = layerBounds.getCenter();
          map.fitBounds(layerBounds);
        }

        map.invalidateSize();
      }

      var addAdoptedStreetMarkers = function(streets, add)
      {
        _mapMarkerGroup.clearLayers();
        for (var i = 0; i < streets.length; i++)
        {
          var street = streets[i];
  
          if (street.properties.isAdopted)
          {
            markerIcon = L.ExtraMarkers.icon({
              prefix: 'fa',
              shape: 'circle',
              icon: 'fa-number',
              number: street.properties.totalAdopters,
              markerColor: street.properties.isAdoptedByUser ? 'blue' : 'green',
            });

            var streetMarker = L.marker(street.streetCenter, {icon: markerIcon});
            streetMarker.street = street;
            streetMarker.on({
              click: function(e) { _mapCallbacks.pinClickCallback(e); }
            });
            _mapMarkerGroup.addLayer(streetMarker);
          }
        }
      }

      var addAllStreetMarkers = function(streets)
      {
        _mapMarkerGroup.clearLayers();
        for (var i = 0; i < streets.length; i++)
        {
          var street = streets[i];

          var markerIcon = L.ExtraMarkers.icon({
            prefix: 'fa',
            shape: 'circle',
            iconColor: '#DCDCDC',
            icon: 'fa-circle',
            markerColor: 'white',
          });
  
          if (street.properties.isAdopted)
          {
            markerIcon = L.ExtraMarkers.icon({
              prefix: 'fa',
              shape: 'circle',
              icon: 'fa-number',
              number: street.properties.totalAdopters,
              markerColor: street.properties.isAdoptedByUser ? 'blue' : 'green',
            });
          }
``
          var streetMarker = L.marker(street.streetCenter, {icon: markerIcon});
          streetMarker.street = street;
          streetMarker.on({
            click: function(e) { _mapCallbacks.pinClickCallback(e); }
          });
          _mapMarkerGroup.addLayer(streetMarker);
        }
      }

      var loadStreets = function(neighborhooData, map) {
        var deferredSetup = $q.defer();

        _deferredMap.promise.then(function(map) {
          setMapLayer(map);

          map.closePopup();

          $http.get("api/streets/byparentgeo/" + neighborhooData._id).success(function(streets, status) {
            setStreetViewSrc(streets);
            var streetLayer = createStreetLayer(streets);
            addAdoptedStreetMarkers(streets);

            _mapLayerGroup.addLayer(streetLayer);
            _mapStreetLayer = streetLayer;

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
        createNeighborhoodTip(mapInstance);     
        createNavigateToBlockControl(mapInstance);         
        createZoomControls(mapInstance);
        createNeighborhoodLegend(mapInstance);
      }

      var createStreetControls = function(mapInstance, isAddressSearch, neighborhooData) 
      {
        clearMapControls(mapInstance);
        createNavigateToNeighborhoodsControl(mapInstance);
        createNavigateToBlockControl(mapInstance);
        createZoomControls(mapInstance);
        createStreetLegend(mapInstance, isAddressSearch);     

        if (neighborhooData)
        {
          createNeighborhoodDetails(mapInstance, neighborhooData);
        }
      }

      var createLocationControls = function(mapInstance, isAddressSearch) 
      {
        clearMapControls(mapInstance);
        createNavigateToStreetsControl(mapInstance);
        createZoomControls(mapInstance);
        createStreetLegend(mapInstance, isAddressSearch);     
      }

      var reloadLastCalled = function()
      {
        if (_lastCalledFunction) _lastCalledFunction();
      }

      var clearMapControls = function(mapInstance) {
        for (var i = 0; i < _mapControls.length; i++)
        {
          var control = _mapControls[i];
          mapInstance.removeControl(control);
        }

        _mapControls = [];
      }

      var createNavigateToNeighborhoodsControl = function(mapInstance) {
        var viewNeigborhoodsControl = L.Control.extend({
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
              var container = L.DomUtil.create('div', 'map-control');
              container.innerHTML = '<a class="map-control-text"><i class="fa fa-map-o"></i> View Neighborhoods</a>';

              container.onclick = function(){
                self.showNeighborhoodLayers();
              }
              return container;
            }
          });

          viewNeigborhoodsControl = new viewNeigborhoodsControl();
          mapInstance.addControl(viewNeigborhoodsControl);
          _mapControls.push(viewNeigborhoodsControl);
      }

      var createNavigateToStreetsControl = function(mapInstance) {
        var viewNeigborhoodsControl = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'map-control');
            container.innerHTML = '<a class="map-control-text"><i class="fa fa-map-o"></i> View Neighborhood Streets</a>';

            container.onclick = function(){
              self.showNeigborhoodStreetsByLocation();
            }
            return container;
          }
        });

        viewNeigborhoodsControl = new viewNeigborhoodsControl();
        mapInstance.addControl(viewNeigborhoodsControl);
        _mapControls.push(viewNeigborhoodsControl);
      }

      var createNavigateToBlockControl = function(mapInstance) {
        if (!$rootScope.currentUser) return;
        
        var viewNeigborhoodsControl = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'map-control');
            container.innerHTML = '<a class="map-control-text"><i class="fa fa-map-o"></i> View your Block</a>';

            container.onclick = function(){
              self.showCurrentUserStreetsNear();
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
              var detailsContainer = L.DomUtil.create('div', 'map-control hidden-xs');
              detailsContainer.innerHTML = '<div><div><h5>' + neighborhooData.name + '</h5></div>' 
                                            + '<div>Total streets: ' + neighborhooData.totalStreets + '</h5></div>' 
                                            + '<div>Participating streets: ' + neighborhooData.totalAdoptedStreets + '</h5></div></div>' ;
              return detailsContainer;
            }
          });
          neighborhoodDetails = new neighborhoodDetails();
          mapInstance.addControl(neighborhoodDetails);
          _mapControls.push(neighborhoodDetails);
      }

      
      var createNeighborhoodTip = function(mapInstance) {
          var neighborhoodTip = L.Control.extend({
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
              var detailsContainer = L.DomUtil.create('div', 'map-control hidden-xs');
              detailsContainer.innerHTML = '<div><i class="fa fa-info-circle"></i> Point at a neighborhood to see details</div>';
              return detailsContainer;
            }
          });
          neighborhoodTip = new neighborhoodTip();
          mapInstance.addControl(neighborhoodTip);
          _mapControls.push(neighborhoodTip);
      }


      var createNeighborhoodLegend = function(mapInstance)
      {
        var neighborhoodLegend = L.Control.extend({
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
              var container = L.DomUtil.create('div', 'map-legend hidden-xs');
              container.innerHTML = '<div><b>Neighborhood:</b>'
                                    + '<div><img class="map-legend-icon" src="/public/img/participating-neighborhood.png"/> Has participants</div>' 
                                    + '<div><img class="map-legend-icon" src="/public/img/future-neighborhood.png"/> No participants</div>' 
                                    + '<div><img class="map-legend-icon" src="/public/img/checked.png"/> Receiving cleanup tools</div>' 
                                    + '<div><img class="map-legend-icon" src="/public/libs/leaflet/dist/images/marker-icon.png"/> Upcoming events</div>'
                                    + '</div>' ;
              return container;
            }
          });
          neighborhoodLegend = new neighborhoodLegend();
          mapInstance.addControl(neighborhoodLegend);
          _mapControls.push(neighborhoodLegend);
      }

      var createStreetLegend = function(mapInstance, isAddressLocation)
      {
        var streetLegend = L.Control.extend({
            options: {
              position: 'topleft'
            },
            onAdd: function (map) {
              var container = L.DomUtil.create('div', 'map-legend hidden-xs');
                container.innerHTML = '<div>' 
                                      + ( isAddressLocation ? 
                                        '<p><img class="map-legend-icon" src="/public/img/home.png"/> Address</p>'  : "" )

                                    + '<b>Streets:</b>'
                                    + '<p><img class="map-legend-icon" src="/public/img/participating-street.png"/> Has participants</p>' 
                                    + '<p><img class="map-legend-icon" src="/public/img/future-street.png"/> No participants</p>' 
                                    + '<b>Pins (total participants):</b>'
                                    + ( isAddressLocation ? '<p><img class="map-legend-icon" src="/public/img/map_marker_white.png"/> No participants</p>' : '')
                                    + '<p><img class="map-legend-icon" src="/public/img/map_marker_blue.png"/> Your street</p>' 
                                    + '<p><img class="map-legend-icon" src="/public/img/map_marker_green.png"/> Other participants</p>' 
                                    + '</div>' ;
              return container;
            }
          });

          streetLegend = new streetLegend();
          mapInstance.addControl(streetLegend);
          _mapControls.push(streetLegend);
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

      var setStreetViewSrc = function(streets)
      {
        for(var i = 0; i < streets.length; i++)
        {
          var street = streets[i];
          var geoJsonLayer = L.geoJson({
            "type" : "Feature",
            "geometry" : street.geometry
          });
          var layerBounds = geoJsonLayer.getBounds();
          var streetCenter = layerBounds.getCenter();

          street["streetCenter"] = streetCenter;
          street["streetMapPreview"] = "/api/external/mapbox-staticmap/" + streetCenter.lng + "/" + streetCenter.lat + "/" + street.totalAdopters;
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
            
            self.showNeigborhoodStreetsById(properties._id);
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
        else
        {
          return {
            color: '#484848',
            weight: 15,
            opacity: 0.2
          };
        }
      };

      var setNeighborhoodIcon = function (layer, feature, map) {
        if (feature.properties.receivesSupplies)
        {
          var layerBounds = layer.getBounds();
          var center = layerBounds.getCenter();

          var myIcon = L.divIcon({html: '<img class="map-legend-icon" src="/public/img/checked.png"></img>',
                        iconAnchor: [20, 15], 
                        className: 'map-label'});
          var tooltipMarker = L.marker(center, {icon: myIcon, riseOnHover: true, interactive: false});
          _mapLayerGroup.addLayer(tooltipMarker);
        }
      }

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
          createNeighborhoodTip(map);
          createNavigateToBlockControl(map); 
          createZoomControls(map);
          createNeighborhoodLegend(map);
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
