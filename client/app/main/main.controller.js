(function () {
angular.module('notinphillyServerApp')
  .controller('mainController', [ '$scope', '$http', '$rootScope', 'mapService', 'sessionService', function($scope, $http, $rootScope, mapService, sessionService) {
    var isLoggedIn = ($rootScope.currentUser === undefined);

    $scope.tooltip = {};
    $scope.sideMenu = {
      isUserProfileVisible: false,
      isUserProfileOpen: false,
      isLoginVisible: true,
      isLoginOpen: false,
      spinnerActive: false,
      onMapReturn : function() {
        $scope.sideMenu.isStreetLevel = false;
        mapService.setNeighborhoodLayers();
    }};

    $scope.$on('spinnerStart', function(event) {
      $scope.sideMenu.spinnerActive = true;
    });
    $scope.$on('spinnerEnd', function(event) {
      $scope.sideMenu.spinnerActive = false;
    });
    $scope.$on('loginSuccess', function(event) {
      $scope.sideMenu.isUserProfileVisible = true;
      $scope.sideMenu.isUserProfileOpen = true;
      $scope.sideMenu.isLoginVisible = false;
      $scope.sideMenu.isLoginOpen = false;
    });

    angular.extend($scope, {
                zoomControl: false,
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
               }
            });

    var mapCallbacks = {
      neighborhoodMouseOverCallback : function(e)
      {
          var x = e.originalEvent.pageX;
          var y = e.originalEvent.pageY;
          var layer = e.target;

          if ( typeof x !== 'undefined' ){
            $scope.tooltip.nhoodTooltipStyle = {
              top: (y - 120 ) + 'px',
              left: (x + 20) + 'px'
            };
            $scope.tooltip.isNhoodTooltipVisible = true;
          }
          else
          {
            $scope.tooltip.isNhoodTooltipVisiblee = false;
          }

          $scope.tooltip.hoverOverNhoodName = layer.feature.properties.name;
          $scope.tooltip.totalStreetsAdopted = 0;
          $scope.tooltip.totalStreets = 100;
      },
      neighborhoodMouseOutCallback : function(e)
      {
          $scope.tooltip.isNhoodTooltipVisible  = false;
      },
      neighborhoodMouseClickCallback : function(e) {
          $scope.sideMenu.isStreetLevel = true;
      },
      streetMouseOverCallback : function(e)
      {
        var x = e.originalEvent.pageX;
        var y = e.originalEvent.pageY;
        if ( typeof x !== 'undefined' ){
          $scope.tooltip.streetTooltipStyle = {
            top: (y - 120 ) + 'px',
            left: (x + 20) + 'px'
          };
          $scope.tooltip.isStreetTooltipVisible = true;
        }
        else
        {
          $scope.tooltip.isStreetTooltipVisiblee = false;
        }

        var layer = e.target;

        $scope.tooltip.hoverOverStreetName = layer.feature.properties.name;
        $scope.tooltip.totalStreetAdopters = 0;

        layer.setStyle({
            opacity: 0.7,
            weight: 15
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
      },
      streetMouseOutCallback: function(e){
          $scope.tooltip.isStreetTooltipVisible = false;

          var layer = e.target;

          layer.setStyle({
            weight: 10,
            opacity: 0.4
          });
      },
      streetClickCallback: function(e){
        if(e.target.feature)
        {
          mapService.showStreetPopup(e.latlng, e.target.feature.properties);
        }
        $scope.tooltip.isStreetTooltipVisible = false;
      }
    };

    mapService.setMapCallbacks(mapCallbacks);
    mapService.setNeighborhoodLayers();
  }]);
})();
