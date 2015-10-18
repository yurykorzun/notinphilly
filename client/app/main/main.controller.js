(function () {
angular.module('notinphillyServerApp')
  .controller('MainCtrl', [ '$scope', '$http', 'mapService', function($scope, $http, mapService) {
    angular.extend($scope, {
                center: {
                    lat: 39.948920,
                    lng: -75.201825,
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
    var mapCallbacks = {
      neighborhoodMouseOverCallback : function(e)
      {
          var x = e.originalEvent.pageX;
          var y = e.originalEvent.pageY;
          if ( typeof x !== 'undefined' ){
            $scope.nhoodTooltipStyle = {
              top: (y - 120 ) + 'px',
              left: (x + 20) + 'px'
            };
            $scope.isNhoodTooltipVisible = true;
          }
          else
          {
            $scope.isNhoodTooltipVisiblee = false;
          }
      },
      neighborhoodMouseOutCallback : function(e)
      {
          $scope.isNhoodTooltipVisible  = false;
      },
      streetMouseOverCallback : function(e)
      {
        var x = e.originalEvent.pageX;
        var y = e.originalEvent.pageY;
        if ( typeof x !== 'undefined' ){
          $scope.streetTooltipStyle = {
            top: (y - 120 ) + 'px',
            left: (x + 20) + 'px'
          };
          $scope.isStreetTooltipVisible = true;
        }
        else
        {
          $scope.isStreetTooltipVisiblee = false;
        }
      },
      streetMouseOutCallback: function(e){
          $scope.isStreetTooltipVisible = false;
      }
    };

    mapService.setMapCallbacks(mapCallbacks);
    mapService.setNeighborhoodLayers();
  }]);
})();
