angular.module('notinphillyServerApp')
  .service('mapService', ['$http', 'leafletData', function($http, leafletData) {
    var mapLayerGroup = L.layerGroup();

    this.setNeighborhoodLayers = function()
    {
      $http.get("api/neighborhoods/getAllGeojson/").success(function(data, status) {
        mapLayerGroup.clearLayers();

        leafletData.getMap().then(function (map) {
          var geoJsonLayer = L.geoJson(data,
          {
            onEachFeature: setNeigborhoodLayerSettings,
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

    var setNeigborhoodLayerSettings = function (feature, layer){
           layer.setStyle(getRandomColor());
           layer.on({
            mouseover: highlightNeighborhood,
            mouseout: resetHighlightNeighborhood,
            click: onLayerClick
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
          map.fitBounds(layerBounds);

          $http.get("api/streets/byparentgeo/" + triggeredFeature.properties.id).success(function(data, status) {
            var geoJsonLayer = L.geoJson(data,
            {
              //onEachFeature: setNeigborhoodLayerSettings,
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
