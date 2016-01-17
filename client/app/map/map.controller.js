(function () {
angular.module('notinphillyServerApp')
  .controller('MapController', [ '$scope', '$compile', '$http', '$rootScope', 'mapService', 'APP_EVENTS', function($scope, $compile, $http, $rootScope, mapService, APP_EVENTS) {
    $scope.tooltip = {};

    mapService.getMap().then(function(map) {
      map.on('blur', function(event) {
        $scope.tooltip.isNhoodTooltipVisible = false;
        $scope.tooltip.isStreetTooltipVisible = false;
      });
      map.on('mouseout', function(mouseEvent) {
        $scope.tooltip.isNhoodTooltipVisible = false;
        $scope.tooltip.isStreetTooltipVisible = false;
      });
      map.on('popupopen', function(popupEvent) {
        // Create the popup view when is opened
        var properties = popupEvent.popup.options.properties;
        var targetPopup = popupEvent.popup;

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

        $compile(popupEvent.popup._contentNode)(newScope);
      });
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
          //$scope.tooltip.isNhoodTooltipVisible = true;
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
          //$scope.tooltip.isStreetTooltipVisible = true;
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
