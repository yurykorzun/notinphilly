(function () {
  angular.module('notinphillyServerApp')
    .service('mapService', ['$http', 'leafletData', function($http, leafletData) {
      var mapLayerGroup = L.layerGroup();
      var mapCallbacks = {
        neighborhoodMouseOverCallback : undefined,
        neighborhoodMouseOutCallback : undefined,
        streetMouseOverCallback : undefined,
        streetMouseOutCallback: undefined
      };

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
                      click: function(e) { onLayerClick(e); mapCallbacks.neighborhoodMouseOutCallback(e); },
                      layerremove: function(e) { mapCallbacks.neighborhoodMouseOutCallback(e); }
                     });
                   },
              style: {
                color: '#486CFA',
                weight: 2,
                fillOpacity: 0.4,
                 fillColor: '#484848'
              }
            });
            mapLayerGroup.addLayer(geoJsonLayer);
            mapLayerGroup.addTo(map);
          });
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
            map.panTo(nhoodCenter);
            map.setZoom(18);

            $http.get("api/streets/byparentgeo/" + triggeredFeature.properties.id).success(function(data, status) {
              var geoJsonLayer = L.geoJson(data,
              {
                onEachFeature : function (feature, layer){
                   //layer.setStyle(getRandomColor());
                   layer.on({
                    mouseover: function(e) { mapCallbacks.streetMouseOverCallback(e); },
                    mouseout: function(e) { mapCallbacks.streetMouseOutCallback(e); }
                  });
                 },
                style: {
                  color: '#484848',
                  weight: 5,
                  fillOpacity: 0.4
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
               color: 'Blue',
               weight: 2,
               fillColor: '#484848',
               fillOpacity: 0.2
             };
             break;
           case 2:
             style = {
               color: 'Blue',
               weight: 2,
               fillColor: '#49586B',
               fillOpacity: 0.2
             };
             break;
           case 3:
             style = {
                 color: 'Blue',
                 weight: 2,
                 fillColor: '#6AC48E',
                 fillOpacity: 0.2
               };
             break;
           case 4:
               style = {
                   color: 'Blue',
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
            color: 'Blue',
            fillOpacity: 0.2,
            weight: 2
          });
      };

     var highlightStreet = function(e) {
          var layer = e.target;

          layer.setStyle({
              opacity: 0.8,
              weight: 15
          });

          if (!L.Browser.ie && !L.Browser.opera) {
              layer.bringToFront();
          }
      };

      var resetHighlightStreet = function(e) {
          var layer = e.target;

          layer.setStyle({
            opacity: 0.5,
            weight: 5
          });
      };
  }]);
})();
