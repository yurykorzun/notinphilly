angular.module('notinphillyServerApp')
  .controller('MainCtrl', [ '$scope', '$http', 'leafletData', 'mapService', function($scope, $http, leafletData, mapService) {
    angular.extend($scope, {
                center: {
                    lat: 39.952604,
                    lng: -75.163368,
                    zoom: 13
                },
                tiles: {
                   name: 'Not in philly map',
                   url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                   type: 'xyz',
                   options: {
                       apikey: 'pk.eyJ1IjoieXVyeWtvcnp1biIsImEiOiJjaWY2eTN2aHMwc3VncnptM3QxMzU3d3hxIn0.Mt0JldEMvvTdWW4GW2RSlQ',
                       mapid: 'yurykorzun.nljndeg0'
                   }
               },
               controls: {
                    fullscreen: {
                        position: 'topleft'
                    }
                }
            });

    $http.get("api/neighborhoods").success(function(data, status) {
        leafletData.getMap().then(function(map) {
          for(var nIndex = 0; nIndex < data.length; nIndex++)
          {
            var geoJsonLayer = L.geoJson(data[nIndex].geodata,
            {
              onEachFeature: mapService.setNeigborhoodLayerSettings,
              style: {
                color: '#486CFA',
                weight: 2,
                fillOpacity: 0.4,
                 fillColor: '#78D2FF'
              }
            });

            geoJsonLayer.addTo(map);
          }
     });
   });
  }]);
