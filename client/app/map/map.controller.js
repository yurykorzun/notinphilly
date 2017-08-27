(function () {
angular.module('notinphillyServerApp')
  .controller('MapController', [ '$scope', '$compile', '$http', '$rootScope', '$cookies',  '$uibModal', 'mapService', 'APP_EVENTS', 'APP_CONSTS', 
  function($scope, $compile, $http, $rootScope, $cookies, $uibModal, mapService, APP_EVENTS, APP_CONSTS) 
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
          $scope.hasParticipants = false;          
        };

        var initView = function() {
          if ($rootScope.currentUser)
          {
            $scope.isAuthorized = true;
          }

          if ($scope.isAuthorized) {
            $scope.isAdoptedByUser = properties.isAdoptedByUser;
            
            if ( ($scope.isAdoptedByUser && (properties.totalAdopters-1) > 0) || (!$scope.isAdoptedByUser && properties.totalAdopters > 0) )
            {
              $scope.hasParticipants = true;          
            }
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
              mapService.adoptStreet(properties._id).then(function(resonse) {
                $scope.isShowAdoptedSuccess = true;
                $rootScope.$broadcast(APP_EVENTS.STREET_ADOPTED);
              },
              function(error) { 
                setUpDefaultView();
                $scope.isShowError = true;
              });
          }
          else
          {
            $cookies.putObject(APP_CONSTS.ADOPTED_STREET, {streetId: properties._id});
            $scope.isShowLogin = true;
          }
        };
        
        newScope.leave = function() {
          mapService.leaveStreet(properties._id).then(function(resonse) {
            targetPopup._close();
            $rootScope.$broadcast(APP_EVENTS.STREET_LEFT);

            initView();
          },
          function(error) { 
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

        newScope.connectWithUsers = function()
        {
          $http.post("api/messages/connections/request/" + properties._id)
              .then(function(response){
                var modalInstance = $uibModal.open({
                  templateUrl: 'app/dialogs/dialog-message.html',
                  controller: 'DialogMessageController',
                  resolve: {
                    messageHeader: function () {
                        return "Success";
                    },
                    messageBody: function () {
                        return "We sent connection requests to participants in the selected street. If they approve them, you will be able send and recieve messages.";
                    },
                    acceptMessage: function () {
                        return "Ok";
                    }
                  },
                  size: "sm"
                });
                modalInstance.result.then(function() {
                });

                targetPopup._close();
              },
              function(err){
                setUpDefaultView();
                $scope.isShowError = true;
              });
        }
        
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

    $scope.$on('$destroy', function () {
      mapService.removeMap();
    });
  }]);
})();
