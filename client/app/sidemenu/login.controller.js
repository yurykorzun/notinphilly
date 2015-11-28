(function () {
  angular.module('notinphillyServerApp')
    .controller('LoginController', [ '$scope', '$http', '$rootScope', 'sessionService', function($scope, $http, $rootScope, sessionService) {
      $scope.loginForm = {
        login : function(form) {
          $rootScope.$broadcast('spinnerStart');
          sessionService.login(form.username,
                                form.password,
                                function(response){
                                  form.spinnerActive = false;
                                  $rootScope.$broadcast('loginSuccess');
                                  $rootScope.$broadcast('spinnerEnd');
                                },
                                function(err) {
                                  form.spinnerActive = false;
                                  $rootScope.$broadcast('spinnerEnd');
                                })
        }
      }
    }]);
})();
