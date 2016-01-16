(function () {
angular.module('notinphillyServerApp')
  .controller('MapController', [ '$scope', '$compile', '$http', '$rootScope', 'mapService', 'APP_EVENTS', function($scope, $compile, $http, $rootScope, mapService, APP_EVENTS) {
    $scope.tooltip = {};

    var center = angular.extend(APP_EVENTS.MAP_CENTER, {zoom: 13});
    angular.extend($scope, {
                zoomControl: false,
                center: center,
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

    $scope.$on('cityMap.mouseout', function(event, leafletEvent){
      $scope.tooltip.isNhoodTooltipVisible = false;
      $scope.tooltip.isStreetTooltipVisible = false;
    });
    $scope.$on('cityMap.blur', function(event, leafletEvent){
      $scope.tooltip.isNhoodTooltipVisible = false;
      $scope.tooltip.isStreetTooltipVisible = false;
    });
    $scope.$on('cityMap.popupopen', function(event, leafletEvent){
      // Create the popup view when is opened
      var properties = leafletEvent.popup.options.properties;
      var targetPopup = leafletEvent.popup;

      $scope.isStart = !properties.isAdopted;
      $scope.isAdopted = properties.isAdopted;
      if ($rootScope.currentUser) {
          $scope.isAuthorized = true;
      } else {
        $scope.isAuthorized = false;
      }
      $scope.isAdoptedSuccessfully = false;
      $scope.isError = false;

      var newScope = $scope.$new();
      newScope.address = properties.hundred + ' ' + properties.name + ' ' + properties.zipCode;
      newScope.streetId = properties.id;
      newScope.imageSrc = properties.imageSrc;

      newScope.adoptStreet = function() {
        $http.get("api/streets/adopt/" + properties.id).success(function(data, status) {
          $scope.isAdoptedSuccessfully = true;
          mapService.addNeigborhoodStreets(properties.parentId);

          $rootScope.$broadcast(APP_EVENTS.STREET_ADOPTED);
        },
        function(err) {
          $scope.isStart = false;
          $scope.isError = true;
        });
      };
      newScope.leave = function() {
        $http.get("api/streets/leave/" + properties.id).success(function(data, status) {
          mapService.addNeigborhoodStreets(properties.parentId);
          targetPopup._close();

          $rootScope.$broadcast(APP_EVENTS.STREET_LEFT);
        });
      };
      newScope.close = function(){
        targetPopup._close();
      }

      $compile(leafletEvent.popup._contentNode)(newScope);
    });
    $scope.$on(APP_EVENTS.ENTER_NEIGBORHOOD_LEVEL, function(event, leafletEvent){
      $scope.sideMenu.isStreetLevel = false;
    });
    $scope.$on(APP_EVENTS.ENTER_STREET_LEVEL, function(event, leafletEvent){
      $scope.sideMenu.isStreetLevel = true;
    });

    var mapCallbacks = {
      neighborhoodMouseOverCallback : function(e)
      {
        var layer = e.target;
        var properties = layer.feature.properties;

        var x = e.originalEvent.pageX;
        var y = e.originalEvent.pageY;

        if ( typeof x !== 'undefined' ){
          $scope.tooltip.nhoodTooltipStyle = {
            top: (y - 120 ) + 'px',
            left: (x + 40) + 'px'
          };
          $scope.tooltip.isNhoodTooltipVisible = true;
        }
        else
        {
          $scope.tooltip.isNhoodTooltipVisiblee = false;
        }

        $scope.tooltip.hoverOverNhoodName = properties.name;
        $scope.tooltip.totalAdoptedStreets = properties.totalAdoptedStreets;
        $scope.tooltip.percentageAdoptedStreets = properties.percentageAdoptedStreets;
        $scope.tooltip.totalStreets = properties.totalStreets;
      },
      neighborhoodMouseOutCallback : function(e)
      {
          var layer = e.target;
          var properties = layer.feature.properties;

          $scope.tooltip.isNhoodTooltipVisible = false;
          $scope.tooltip.isStreetTooltipVisible = false;
      },
      neighborhoodMouseClickCallback : function(e) {
          $rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
      },
      streetMouseOverCallback : function(e)
      {
        var x = e.originalEvent.pageX;
        var y = e.originalEvent.pageY;
        if ( typeof x !== 'undefined' ){
          $scope.tooltip.streetTooltipStyle = {
            top: (y - 100 ) + 'px',
            left: (x + 20) + 'px'
          };
          $scope.tooltip.isStreetTooltipVisible = true;
        }
        else
        {
          $scope.tooltip.isStreetTooltipVisiblee = false;
        }

        var layer = e.target;
        var properties = layer.feature.properties;

        $scope.tooltip.hoverOverStreetName = properties.type + ' ' + properties.hundred + ' ' + properties.name + ' ' + properties.zipCode;
        $scope.tooltip.totalStreetAdopters = properties.totalAdopters;

        layer.setStyle({
            opacity: 0.7,
            weight: 22
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
      },
      streetMouseOutCallback: function(e){
          var layer = e.target;
          var properties = layer.feature.properties;

          $scope.tooltip.isNhoodTooltipVisible = false;
          $scope.tooltip.isStreetTooltipVisible = false;

          layer.setStyle({
            weight: 15,
            opacity: 0.4
          });
      },
      streetClickCallback: function(e){
        if(e.target.feature)
        {
          mapService.showStreetPopup(e.latlng, e.target);
        }
        $scope.tooltip.isStreetTooltipVisible = false;
      }
    };

    mapService.setMapCallbacks(mapCallbacks);
    mapService.setNeighborhoodLayers();
  }]);
})();
