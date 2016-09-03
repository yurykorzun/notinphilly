(function () {
  angular.module('notinphillyServerApp')
  .controller('UserProfileController', [ '$scope', '$http', '$rootScope', '$location', 'sessionService', 'mapService', 'APP_EVENTS',
    function($scope, $http, $rootScope, $location, sessionService, mapService, APP_EVENTS) {
      $scope.userProfile = {
        isEditing: false,
        isAdmin: false
      };
      $scope.user = {
        adoptedStreets: []
      };

      function SetupCurrentUser()
      {
        if($rootScope.currentUser)
        {
          $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
          $scope.userProfile.isAdmin = $rootScope.currentUser.isAdmin;
          $http.get("api/users/current/").success(function(data, status) {
            $scope.user = data;
            SetupUserStreets();
            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
          },
          function(err) {
            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
          });
        }
      }

      function SetupUserStreets(){
        mapService.getStreetsForCurrentUser().then(function(response){
          $scope.user.adoptedStreets = response;
        },
        function(err) {

        });
      }

      $scope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
        SetupCurrentUser();
      });
      $scope.$on(APP_EVENTS.LOGOUT, function(event) {

      });
      $scope.$on(APP_EVENTS.STREET_ADOPTED, function(event) {
        SetupUserStreets();
      });
      $scope.$on(APP_EVENTS.STREET_LEFT, function(event) {
        SetupUserStreets();
      });

      $scope.locateStreet = function (streetId)
      {
        mapService.showStreets($scope.streets);
        mapService.selectStreet(streetId);

        $rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
        $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
      };

      $scope.hasStreets = function ()
      {
        return $scope.user.adoptedStreets.length > 0
      };

      $scope.switchToMap = function() {
        mapService.showStreets($scope.user.adoptedStreets);
        $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
      };

      $scope.navigateToAdmin = function ()
      {
        if($rootScope.currentUser && $rootScope.currentUser.isAdmin)
        {
          $location.path("/admin");
        }
      }

      $scope.toggleEdit = function () {
        $scope.userProfile.isEditing = !$scope.userProfile.isEditing;
      };

      $scope.update = function () {
        $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
        if($scope.user)
        {
          if($scope.addressDetails)
          {
            var address = $scope.addressDetails;

            $scope.user.zip = address.postalCode;
            $scope.user.city = address.city;
            $scope.user.stateName = address.state;
            $scope.user.streetName = address.streetName;
            $scope.user.streetNumber = address.streetNumber;
            $scope.user.addressLocation = address.location;
          }

          $http.put('/api/users/', $scope.user).
            success(function(data) {
              SetupCurrentUser();
              // Collapse edit form after updating user
              $scope.userProfile.isEditing = false;
              $rootScope.$broadcast(APP_EVENTS.SPINNER_END)
            }).error(function(err) {
              // Update user error
              $scope.errorMessage = err;
              $rootScope.$broadcast(APP_EVENTS.SPINNER_END)
            });
        }
      };

      $scope.logout = function() {
        $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
        sessionService.logout().then(function(response){
          $rootScope.$broadcast(APP_EVENTS.LOGOUT);
          $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
        },
        function(err) {
          $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
        });
      };

      SetupCurrentUser();
    }]);
})();
