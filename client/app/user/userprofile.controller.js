(function () {
  angular.module('notinphillyServerApp')
  .controller('UserProfileController', [ '$scope', '$http', '$rootScope', 'sessionService', 'mapService', 'APP_EVENTS',
    function($scope, $http, $rootScope, sessionService, mapService, APP_EVENTS) {
      $scope.userProfile = {
        isEditing: false
      };
      $scope.user = {
        adoptedStreets: []
      };

      function SetupCurrentUser()
      {
        if($rootScope.currentUser)
        {
          $http.get("api/users/current/").success(function(data, status) {
            $scope.user = data;
            SetupUserStreets();
          },
          function(err) {
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

      $scope.toggleEdit = function () {
        $scope.userProfile.isEditing = !$scope.userProfile.isEditing;
      };

      $scope.update = function () {
        if($scope.user)
        {
          $http.put('/api/users/', $scope.user).
            success(function(data) {
              // Collapse edit form after updating user
              $scope.userProfile.isEditing = false;
            }).error(function(err) {
              // Update user error
              $scope.errorMessage = err;
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
