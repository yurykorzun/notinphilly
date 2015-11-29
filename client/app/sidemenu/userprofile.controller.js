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
    }]);
})();
