angular.module('notinphillyServerApp')
  .controller('MainCtrl', [ '$scope', '$http', 'mapService', function($scope, $http, mapService) {
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

    mapService.mapCallbacks.neighborhoodMouseOverCallback == function(e)
    {
        var x = e.originalEvent.pageX;
        var y = e.originalEvent.pageY;
        if ( typeof x !== 'undefined' ){
          $scope.tooltipStyle = {
            top: (y - 120 ) + 'px',
            left: (x + 20) + 'px'
          };
          $scope.isNhoodTooltipVisible = true;
        }
        else
        {
          $scope.isNhoodTooltipVisiblee = false;
        }
    };
    mapService.mapCallbacks.neighborhoodMouseOutCallback = function(e)
    {
        $scope.isNhoodTooltipVisible  = false;
    };
    mapService.mapCallbacks.streetMouseOverCallback = function(e)
    {
      var x = e.originalEvent.pageX;
      var y = e.originalEvent.pageY;
      if ( typeof x !== 'undefined' ){
        $scope.tooltipStyle = {
          top: (y - 120 ) + 'px',
          left: (x + 20) + 'px'
        };
        $scope.isStreetTooltipVisible = true;
      }
      else
      {
        $scope.isStreetTooltipVisiblee = false;
      }
    };
    mapService.mapCallbacks.streetMouseOutCallback = function(e){
        $scope.isStreetTooltipVisible = false;
    };

    mapService.setNeighborhoodLayers();
  }]);
