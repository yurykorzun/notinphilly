(function () {
  angular.module('notinphillyServerApp')
    .controller('UserProfileController', [ '$scope', '$http', '$rootScope', 'sessionService', 'APP_EVENTS', function($scope, $http, $rootScope, sessionService, APP_EVENTS) {
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
        }
      };

      $scope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
        SetUpCurrentUser();
      });
      $scope.$on(APP_EVENTS.LOGOUT, function(event) {

      });

      function SetUpCurrentUser()
      {
        if($rootScope.currentUser)
        {
          $http.get("api/users/current/").success(function(data, status) {
            $scope.userProfile.fullName = data.firstName + ' ' + data.lastName;
            $scope.userProfile.address = data.addressLine1 + ' ' + data.city + ' ' + data.zip;
            $scope.userProfile.email = data.email;
          },
          function(err) {

          });
        }
      }
    }]);
})();
