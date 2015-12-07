(function () {
angular.module('notinphillyServerApp')
  .controller('MapController', [ '$scope', 'mapService', '$compile', '$http', function($scope, mapService, $compile, $http) {
    $scope.tooltip = {};

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

    $scope.$on('leafletDirectiveMap.cityMap.mouseout', function(event, leafletEvent){
      $scope.tooltip.isNhoodTooltipVisible = false;
      $scope.tooltip.isStreetTooltipVisible = false;
    });
    $scope.$on('leafletDirectiveMap.cityMap.blur', function(event, leafletEvent){
      $scope.tooltip.isNhoodTooltipVisible = false;
      $scope.tooltip.isStreetTooltipVisible = false;
    });

    $scope.$on('leafletDirectiveMap.cityMap.popupopen', function(event, leafletEvent){
      // Create the popup view when is opened
      var properties = leafletEvent.leafletEvent.popup.options.properties;
      var targetPopup = leafletEvent.leafletEvent.popup;

      $scope.isStart = !properties.isAdopted;
      $scope.isAdopted = properties.isAdopted;

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
        });
      };
      newScope.close = function(){
        targetPopup._close();
      }

      $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);
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

          if(properties.active)
          {
            $scope.tooltip.isNhoodTooltipVisible = false;

            var layer = e.target;
            var properties = layer.feature.properties;
          }
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
            weight: 15
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
      },
      streetMouseOutCallback: function(e){
          $scope.tooltip.isStreetTooltipVisible = false;

          var layer = e.target;
          var properties = layer.feature.properties;

          layer.setStyle({
            weight: 10,
            opacity: 0.4
          });
      },
      streetClickCallback: function(e){
        if(e.target.feature)
        {
          mapService.showStreetPopup(e.latlng, e.target, e.target.feature.properties);
        }
        $scope.tooltip.isStreetTooltipVisible = false;
      }
    };

    mapService.setMapCallbacks(mapCallbacks);
    mapService.setNeighborhoodLayers();
  }]);
})();
