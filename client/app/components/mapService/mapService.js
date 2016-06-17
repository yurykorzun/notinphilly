(function () {
  angular.module('notinphillyServerApp')
    .service('mapService', ['$http', '$q', 'APP_EVENTS', 'APP_CONSTS', function($http, $q, APP_EVENTS, APP_CONSTS) {

      var deferredMap = $q.defer();

      var mapLayerGroup = L.layerGroup();
      var mapCallbacks = {
        neighborhoodMouseOverCallback : undefined,
        neighborhoodMouseOutCallback : undefined,
        neighborhoodMouseClickCallback : undefined,
        streetMouseOverCallback : undefined,
        streetMouseOutCallback: undefined
      };

      this.setMap = function(mapInstance) {
        deferredMap.resolve(mapInstance);
      };

      this.getMap = function() {
        return deferredMap.promise;
      };

      this.setMapCallbacks = function(callbacks) {
        mapCallbacks = callbacks;
      };

      this.setNeighborhoodLayers = function() {
        deferredMap.promise.then(function(map) {
          $http.get("api/neighborhoods/getAllGeojson/").success(function(data, status) {
            mapLayerGroup.clearLayers();

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
           });
        });
      };

      this.showStreetPopup = function(clickLatLang, streetLayer) {
        deferredMap.promise.then(function(map) {
          var properties = streetLayer.feature.properties;
          var geometry = streetLayer.feature.geometry;

          var start = L.latLng(geometry.coordinates[0][1], geometry.coordinates[0][0]);
          var end = L.latLng(geometry.coordinates[1][1], geometry.coordinates[1][0]);
          var streetBounds = new L.LatLngBounds(start, end);
          var streetCenter = streetBounds.getCenter();

          openStreetLayerPopup(streetCenter, streetLayer, properties);
        });
      };

      this.addNeigborhoodStreets = function(neighborhoodId) {
        deferredMap.promise.then(function(map) {
          setupStreets(neighborhoodId, map);
        });
      };

      this.goToStreet = function(streetId) {
          console.log("Gotostreets");
        deferredMap.promise.then(function(map) {
          $http.get("api/streets/" + streetId).success(function(streetData, status) {
            $http.get("api/neighborhoods/" + streetData.neighborhood).success(function(neighborhooData, status) {
              var start = L.latLng(streetData.geodata.geometry.coordinates[0][1], streetData.geodata.geometry.coordinates[0][0]);
              var end = L.latLng(streetData.geodata.geometry.coordinates[1][1], streetData.geodata.geometry.coordinates[1][0]);
              var streetBounds = new L.LatLngBounds(start, end);

              var geoJsonLayer = L.geoJson(neighborhooData.geodata);
              var layerBounds = geoJsonLayer.getBounds();
              var streetCenter = layerBounds.getCenter();
              setupStreets(streetData.neighborhood, map).then(function(layers) {
                map.setView(streetCenter, 16, { animate: false });

                var foundLayer = layers.filter(function(layer) {
                  return layer.feature.properties.id === streetData._id;
                });

                openStreetLayerPopup(streetCenter, foundLayer[0], foundLayer[0].feature.properties);
              });
            });
          });
        });
      };
      
      this.goToCoordinates = function(lat, lng) {
          console.log(lat + "  " + lng)
         deferredMap.promise.then(function(map) {
             map.setView([lat,lng], 16, {animate: false});
         })
      }
      
      this.getBounds = function() {
              var geoJsonLayer = L.geoJson(neighborhooData.geodata);
              var layerBounds = geoJsonLayer.getBounds();
              
              return layerBounds;
      }

      this.zoomIn = function(zoomDelta) {
        deferredMap.promise.then(function(map) {
          map.zoomIn(zoomDelta);
        });
      };

      this.zoomOut = function(zoomDelta) {
        deferredMap.promise.then(function(map) {
          map.zoomOut(zoomDelta);
        });
      };

      var setupStreets = function(neighborhoodId, map) {
        var deferredSetup = $q.defer();

        deferredMap.promise.then(function(map) {
          mapLayerGroup.clearLayers();

          $http.get("api/streets/byparentgeo/" + neighborhoodId).success(function(data, status) {
            var geoJsonLayer = L.geoJson(data, {
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
            mapLayerGroup.addLayer(geoJsonLayer);
            geoJsonLayer.addTo(map);

            deferredSetup.resolve(geoJsonLayer.getLayers());
          }, function(err) {
            deferredSetup.reject(err);
          });
        });

        return deferredSetup.promise;
      };

      var onNeighborhoodLayerClick = function(e) {
        if (e.target.feature) {
          deferredMap.promise.then(function(map) {
            var triggeredFeature = e.target.feature;
            var properties = triggeredFeature.properties;
            var layerBounds = e.layer.getBounds();

            var nhoodCenter = layerBounds.getCenter();
            nhoodCenter.lng = nhoodCenter.lng - 0.001;
            map.panTo(nhoodCenter);
            map.setZoom(16, { animate: false });
            map.invalidateSize();

            setupStreets(properties.id, map);
          });
        }
      };

      var openStreetLayerPopup = function(streetLongLat, layer, properties) {
        var imageSrc = "https://maps.googleapis.com/maps/api/streetview?size=220x100&location=" +  streetLongLat.lat + "," + streetLongLat.lng  + "&fov=70&heading=170&pitch=10";

        properties.imageSrc = imageSrc;
        var popup = L.popup({
          keepInView: true,
          minWidth: 240,
          autoPan: false,
          properties: properties
        });
        layer.bindPopup(popup);

        $http.get('app/map/street-popup-template.html').then(function(response) {
          var rawHtml = response.data;
          popup.setContent(rawHtml);
          layer.openPopup();
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

      // var setNeighborhoodLabel = function (feature, layer, map)
      // {
      //   layer.bindLabel("<p><h4>" + feature.properties.name + "</h4></p>" +
      //                   "<p>Total streets: " + feature.properties.totalStreets + "</p>" +
      //                   "<p>Participating streets: " + feature.properties.totalAdoptedStreets + "</p>"
      //                   , {
      //                       noHide: true,
      //                       direction: 'auto'
      //                   }).addTo(mapLayerGroup);
      // }

      // var setStreetLabel = function (feature, layer)
      // {
      //   layer.bindLabel("<p><h4>" + feature.properties.hundred + " " + feature.properties.name + " " + feature.properties.type + " " + feature.properties.zipCode + "</h4></p>" +
      //                   "<p>Total participants " + feature.properties.totalAdopters + "</p>",
      //                   {
      //                       noHide: true,
      //                       direction: 'auto'
      //                   }).addTo(mapLayerGroup);
      // }

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
