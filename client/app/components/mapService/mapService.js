(function () {
  angular.module('notinphillyServerApp')
    .service('mapService', ['$http', 'leafletData', function($http, leafletData) {
      var mapLayerGroup = L.layerGroup();
      var mapCallbacks = {
        neighborhoodMouseOverCallback : undefined,
        neighborhoodMouseOutCallback : undefined,
        neighborhoodMouseClickCallback : undefined,
        streetMouseOverCallback : undefined,
        streetMouseOutCallback: undefined
      };

      //Remove builtin zoom control
      leafletData.getMap().then(function (map) {
        if(map.zoomControl)
        {
          map.zoomControl.removeFrom(map);
        }
      });

      this.setMapCallbacks = function(callbacks) {
        mapCallbacks = callbacks;
      };

      this.setNeighborhoodLayers = function()
      {
        $http.get("api/neighborhoods/getAllGeojson/").success(function(data, status) {
          mapLayerGroup.clearLayers();

          leafletData.getMap().then(function (map) {
            var geoJsonLayer = L.geoJson(data,
            {
              onEachFeature: function (feature, layer){
                     layer.setStyle(getRandomColor());
                     layer.on({
                      mouseover: function(e) { highlightNeighborhood(e); mapCallbacks.neighborhoodMouseOverCallback(e); },
                      mouseout: function(e) { resetHighlightNeighborhood(e); mapCallbacks.neighborhoodMouseOutCallback(e); },
                      click: function(e) { onLayerClick(e); mapCallbacks.neighborhoodMouseOutCallback(e); mapCallbacks.neighborhoodMouseClickCallback(e); },
                      layerremove: function(e) { mapCallbacks.neighborhoodMouseOutCallback(e); }
                     });
                   },
              style: {
                color: '#9A9B9C',
                weight: 2,
                fillOpacity: 0.4,
                fillColor: '#484848'
              }
            });
            map.setZoom(13);
            mapLayerGroup.addLayer(geoJsonLayer);
            mapLayerGroup.addTo(map);
          });
         });
      }

      this.showStreetPopup = function(streetLongLat, properties)
      {
        leafletData.getMap().then(function (map) {
          var imageSrc = "https://maps.googleapis.com/maps/api/streetview?size=190x190&location=" +  streetLongLat.lat + "," + streetLongLat.lng  + "&fov=70&heading=170&pitch=10"

          var popup = L.popup({
          })
          .setLatLng(streetLongLat)
          .setContent("<p>Let's adopt a street!<br /> Street: " + properties.name + " " + properties.hundred + ", zipcode: " + properties.zipCode + "</p><p><button type='button' class='btn btn-success'>I am in!</button></p><p> <img height='150px' width='190px' style='margin-left: 5px;' src='" + imageSrc + "' /></p>");

          popup.openOn(map);

          map.panTo({lat: streetLongLat.lat, lng: streetLongLat.lng});
        });
      }

      var onLayerClick = function(e)
      {
        if(e.target.feature)
        {
          leafletData.getMap().then(function (map) {
            var triggeredFeature = e.target.feature;
            var layerBounds = e.layer.getBounds();

            mapLayerGroup.clearLayers();
            //map.fitBounds(layerBounds);

            var nhoodCenter = layerBounds.getCenter();
            nhoodCenter.lng = nhoodCenter.lng - 0.001;
            map.panTo(nhoodCenter);
            map.setZoom(16);

            $http.get("api/streets/byparentgeo/" + triggeredFeature.properties.id).success(function(data, status) {
              var geoJsonLayer = L.geoJson(data,
              {
                onEachFeature : function (feature, layer){
                   //layer.setStyle(getRandomColor());
                   layer.on({
                    mouseover: function(e) { mapCallbacks.streetMouseOverCallback(e); },
                    mouseout: function(e) { mapCallbacks.streetMouseOutCallback(e); },
                    click: function(e) { mapCallbacks.streetClickCallback(e); }
                  });
                 },
                style: {
                  color: '#484848',
                  weight: 10,
                  opacity: 0.4
                }
              });
              mapLayerGroup.addLayer(geoJsonLayer);
              geoJsonLayer.addTo(map);
            });
          });
        }
      }


      var getRandomColor = function ()
      {
         var colorValue = Math.floor(Math.random() * 4) + 1;
         var style= {};

         switch (colorValue) {
           case 1:
             style = {
               color: '#9A9B9C',
               weight: 2,
               fillColor: '#484848',
               fillOpacity: 0.2
             };
             break;
           case 2:
             style = {
               color: '#9A9B9C',
               weight: 2,
               fillColor: '#49586B',
               fillOpacity: 0.2
             };
             break;
           case 3:
             style = {
                 color: '#9A9B9C',
                 weight: 2,
                 fillColor: '#6AC48E',
                 fillOpacity: 0.2
               };
             break;
           case 4:
               style = {
                   color: '#9A9B9C',
                   weight: 2,
                   fillColor: '#26A053',
                   fillOpacity: 0.2
                 };
               break;
         }

         return style;
      };

      var highlightNeighborhood = function(e) {
          var layer = e.target;

          layer.setStyle({
              weight: 7,
              fillOpacity: 0.9,
              color: '#666'
          });

          if (!L.Browser.ie && !L.Browser.opera) {
              layer.bringToFront();
          }
      };

      var resetHighlightNeighborhood = function(e) {
          var layer = e.target;

          layer.setStyle({
            color: '#9A9B9C',
            fillOpacity: 0.2,
            weight: 2
          });
      };
  }]);
})();
