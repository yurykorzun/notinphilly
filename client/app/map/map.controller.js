(function () {
angular.module('notinphillyServerApp')
  .controller('MapController', [ '$scope', '$routeParams', '$compile', '$http', '$rootScope', '$timeout', '$cookies', '$location', 'mapService', 'APP_EVENTS', 'APP_CONSTS', 
  function($scope, $routeParams, $compile, $http, $rootScope, $timeout, $cookies, $location, mapService, APP_EVENTS, APP_CONSTS) 
  {
    $scope.mapTooltip = $("#map-tooltip");

    var showMapTooltip = function(position, content)
    {
      $scope.mapTooltip
        .show()
        .css(position)
        .find('#tooltipValue').html(content);
    }

    var hideMapTooltip = function()
    {
      $scope.mapTooltip.find('#tooltipValue').html("");
      $scope.mapTooltip.hide();
    }

    mapService.getMap().then(function(map) {
      map.on('zoomend', function(zoomEvent) {
      });

      map.on('popupopen', function(popupEvent) {
        if (!popupEvent.popup.options || !popupEvent.popup.options.properties) return;

        var setUpDefaultView = function(){
          $scope.isAuthorized = false;
          $scope.isAdoptedByUser = false;
          $scope.isShowAdoptedSuccess = false;
          $scope.isShowError = false;
          $scope.isShowLogin = false;
        };

        var initView = function() {
          if ($rootScope.currentUser)
          {
            $scope.isAuthorized = true;
          }

          if ($scope.isAuthorized) {
            $scope.isAdoptedByUser = properties.isAdoptedByUser;
          } else {
            $scope.isAdoptedByUser = false;
          }
        };

        // Create the popup view when is opened
        var properties = popupEvent.popup.options.properties;
        var popupLocation = popupEvent.popup.getLatLng();
        var targetPopup = popupEvent.popup;

        setUpDefaultView();
        initView();

        var newScope = $scope.$new();
        newScope.streetId = properties._id;
        newScope.totalAdopters = properties.totalAdopters;
        newScope.address = properties.name;
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
          if ($scope.isAuthorized) {
            $http.get("api/streets/adopt/" + properties._id).then(function(response) {
              setUpDefaultView();
              $scope.isShowAdoptedSuccess = true;
              mapService.addNeigborhoodStreets(popupLocation);
     
              $rootScope.$broadcast(APP_EVENTS.STREET_ADOPTED);
            },
            function(err) {
              setUpDefaultView();
              $scope.isShowError = true;
            });
          }
          else
          {
            $cookies.putObject(APP_CONSTS.ADOPTED_STREET, {streetId: properties._id});
            setUpDefaultView();
            $scope.isShowLogin = true;
          }
        };
        
        newScope.leave = function() {
          $http.get("api/streets/leave/" + properties._id).then(function(response) {
            mapService.addNeigborhoodStreets(popupLocation);
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
          $http.get("api/userstats/checkin?uid=" + $rootScope.currentUser._id +"&sid=" + properties._id).then(function(response){
            targetPopup._close();
          },
          function(err){
            setUpDefaultView();
            $scope.isShowError = true;
          });
        };
        
        $compile(popupEvent.popup._contentNode)(newScope);
      });
    });

    var mapCallbacks = {
      neighborhoodMouseOverCallback : function(e) {
        var neighborhoodProperties = e.target.feature.properties;
        var tooltipPosition = { top: e.originalEvent.clientY, left: e.originalEvent.clientX };
        var tooltipValue = "<div>" + neighborhoodProperties.name 
                                   + "</div><div>Participating streets: " + neighborhoodProperties.totalAdoptedStreets + "</div>"
                                   + "<div>Total streets: " + neighborhoodProperties.totalStreets + "</div>";
        
        showMapTooltip(tooltipPosition, tooltipValue);
      },
      neighborhoodMouseOutCallback : function(e) {
        hideMapTooltip();
      },
      neighborhoodMouseClickCallback : function(e) {
        $rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
        hideMapTooltip();
      },
      streetMouseOverCallback : function(e) {  
        var streetProperties = e.target.feature.properties;
        var tooltipPosition = { top: e.originalEvent.clientY, left: e.originalEvent.clientX };
        var tooltipValue = "<div>" + streetProperties.name + "</div><div>Participants: " + streetProperties.totalAdopters + "</div>";

        showMapTooltip(tooltipPosition, tooltipValue);
      },
      streetMouseOutCallback: function(e) {
        var streetProperties = e.target.feature.properties;
        
        hideMapTooltip();
      },
      streetClickCallback: function(e) {
        if (e.target.feature) {
          mapService.showStreetPopup(e.target.feature);
        }

        hideMapTooltip();
      },
      pinClickCallback: function(e) {
        if (e.target.street) {
          mapService.showStreetPopup(e.target.street);
        }

        hideMapTooltip();
      }
    };
   
    mapService.setMapCallbacks(mapCallbacks);
    if ($routeParams.lng && $routeParams.lat)
    {
      mapService.showStreetsNear({ lng: parseFloat($routeParams.lng), lat: parseFloat($routeParams.lat) });  
    }
    else if ($routeParams.mapView)
    {
      switch($routeParams.mapView)
      {
        case APP_CONSTS.MAPVIEW_CURRENTUSER_PATH:
          mapService.showUserStreets();
          if ($routeParams.id)
          {
            mapService.selectStreet($routeParams.id);
          }
          break;
        case APP_CONSTS.MAPVIEW_STREETS_PATH:
          break;
        default: 
          mapService.showNeighborhoodLayers();
          break;
      }
    }
    else
    {
      mapService.showNeighborhoodLayers();
    }
    
    mapService.setFacebookEvents();

    $scope.$on('$destroy', function () {
      mapService.removeMap();
    });
  }]);
})();
