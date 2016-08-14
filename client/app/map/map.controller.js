(function () {
angular.module('notinphillyServerApp')
  .controller('MapController', [ '$scope', '$compile', '$http', '$rootScope', '$timeout', 'mapService', 'APP_EVENTS', function($scope, $compile, $http, $rootScope, $timeout, mapService, APP_EVENTS) {
    $scope.$on(APP_EVENTS.OPENED_EXPLORE, function(event) {
        $timeout(function() {
            mapService.resetSize();
        }, 30);
    });

    $scope.$on(APP_EVENTS.CLOSED_EXPLORE, function(event) {

    });

    mapService.getMap().then(function(map) {
      map.on('popupopen', function(popupEvent) {

        var setUpDefaultView = function(){
          $scope.isAuthorized = false;
          $scope.isAdoptedByUser = false;
          $scope.isShowAdoptedSuccess = false;
          $scope.isShowError = false;
          $scope.isShowLogin = false;
        };

        var initView = function() {
          $scope.isAuthorized = ($rootScope.currentUser !== undefined);

          if ($scope.isAuthorized) {
            $scope.isAdoptedByUser = properties.isAdoptedByUser;
          } else {
            $scope.isAdoptedByUser = false;
          }
        };

        // Create the popup view when is opened
        var properties = popupEvent.popup.options.properties;
        var targetPopup = popupEvent.popup;

        setUpDefaultView();
        initView();

        var newScope = $scope.$new();
        newScope.totalAdopters = properties.totalAdopters;
        newScope.address = (properties.hundred ? properties.hundred : '')  + ' ' + properties.name + ' ' + properties.zipCode;
        newScope.streetId = properties.id;
        newScope.imageSrc = properties.imageSrc;

        newScope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
          setUpDefaultView();
          initView();
        });

        newScope.$on(APP_EVENTS.LOGOUT, function(event) {
          setUpDefaultView();
          initView();
        });

        newScope.$on(APP_EVENTS.LOGIN_FAILED, function(event) {
          setUpDefaultView();
          $scope.isShowLogin = true;
        });

        newScope.adoptStreet = function() {
          $http.get("api/streets/adopt/" + properties.id).then(function(response) {
            setUpDefaultView();
            $scope.isShowAdoptedSuccess = true;
            mapService.addNeigborhoodStreets(properties.parentId);

            $rootScope.$broadcast(APP_EVENTS.STREET_ADOPTED);
          },
          function(err) {
            setUpDefaultView();
            $scope.isShowError = true;
          });
        };
        
        newScope.leave = function() {
          $http.get("api/streets/leave/" + properties.id).then(function(response) {
            mapService.addNeigborhoodStreets(properties.parentId);
            targetPopup._close();

            $rootScope.$broadcast(APP_EVENTS.STREET_LEFT);
          },
          function(err) {
            setUpDefaultView();
            $scope.isShowError = true;
          });
        };

        newScope.close = function() {
          targetPopup._close();
        };

        newScope.checkin = function() {
          $http.get("api/userstats/checkin?uid=" + $rootScope.currentUser._id +"&sid=" + properties.id).then(function(response){
            targetPopup._close();
          },
          function(err){
            setUpDefaultView();
            $scope.isShowError = true;
          });
        };

        newScope.showLogin = function() {
          setUpDefaultView();
          $scope.isShowLogin = true;
        };

        $compile(popupEvent.popup._contentNode)(newScope);
      });
    });

    $scope.$on(APP_EVENTS.ENTER_NEIGBORHOOD_LEVEL, function(event, leafletEvent){

    });
    $scope.$on(APP_EVENTS.ENTER_STREET_LEVEL, function(event, leafletEvent){
    });

    var mapCallbacks = {
      neighborhoodMouseOverCallback : function(e) {
      },
      neighborhoodMouseOutCallback : function(e) {
      },
      neighborhoodMouseClickCallback : function(e) {
        $rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
      },
      streetMouseOverCallback : function(e) {
      },
      streetMouseOutCallback: function(e) {
      },
      streetClickCallback: function(e) {
        if (e.target.feature) {
          mapService.showStreetPopup(e.target.feature);
        }
      },
      pinClickCallback: function(e) {
        if (e.target.street) {
          mapService.showStreetPopup(e.target.street);
        }
      }
    };

    mapService.setMapCallbacks(mapCallbacks);
    mapService.setNeighborhoodLayers();
  }]);
})();
