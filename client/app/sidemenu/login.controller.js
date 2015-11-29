(function () {
  angular.module('notinphillyServerApp')
    .controller('LoginController', [ '$scope', '$http', '$rootScope', 'sessionService', 'APP_EVENTS', function($scope, $http, $rootScope, sessionService, APP_EVENTS) {
      $scope.loginForm = {
        login : function(form) {
          $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
          sessionService.login(form.email,
                               form.password)
                               .then(function(response){
                                  $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                                  $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                                },
                                function(err) {
                                  $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                                });
        }
      }
    }]);
})();
