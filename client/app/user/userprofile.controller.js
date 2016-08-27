(function () {
  angular.module('notinphillyServerApp')
  .controller('UserProfileController', [ '$scope', '$http', '$rootScope', 'sessionService', 'mapService', 'APP_EVENTS',
    function($scope, $http, $rootScope, sessionService, mapService, APP_EVENTS) {
      $scope.userProfile = {
        logout: function() {
          $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
          sessionService.logout().then(function(response){
            $rootScope.$broadcast(APP_EVENTS.LOGOUT);
            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
          },
          function(err) {
            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
          });
        },
        adoptedStreets: [],
        editForm: false,
        toggleEdit: function () {
          $scope.userProfile.editForm = !$scope.userProfile.editForm;
        },
        update: function () {
          var userId = $rootScope.currentUser._id;
          $scope.userProfile._id = userId;

          $http.put('/api/users/' + userId, $scope.userProfile).
            success(function(data) {
              // Collapse edit form after updating user
              $scope.userProfile.editForm = false;
            }).error(function(err) {
              // Update user error
              $scope.errorMessage = err;
            });
        }
      };

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
        return $scope.userProfile.adoptedStreets.length > 0
      };

      $scope.switchToMap = function() {
        mapService.showStreets($scope.userProfile.adoptedStreets);
        $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
      };

      SetupCurrentUser();

      function SetupCurrentUser()
      {
        if($rootScope.currentUser)
        {
          $http.get("api/users/current/").success(function(data, status) {
            $scope.userProfile.fullName = data.firstName + ' ' + data.lastName;
            $scope.userProfile.address = data.streetNumber + " " + data.streetName + " " + data.zip;
            $scope.userProfile.email = data.email;

            $scope.userProfile.houseNumber = data.houseNumber;
            $scope.userProfile.streetName = data.streetName;
            $scope.userProfile.aptNumber = data.apartmentNumber;
            $scope.userProfile.zip = data.zip;

            SetupUserStreets();
          },
          function(err) {

          });
        }
      }

      function SetupUserStreets(){
        mapService.getStreetsForCurrentUser().then(function(response){
          $scope.userProfile.adoptedStreets = response;
        },
        function(err) {

        });
      }
    }]);
})();
