(function () {
  angular.module('notinphillyServerApp')
    .controller('LoginController', [ '$scope', '$http', '$rootScope', '$uibModal', 'sessionService', 'APP_EVENTS', function($scope, $http, $rootScope, $uibModal, sessionService, APP_EVENTS) {
      $scope.loginForm = {
        login : function(form) {
          $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
          sessionService.login(form.email,
                               form.password)
                               .then(function(response){
                                  $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                                  $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                                  $scope.authError = false;
                                },
                                function(err) {
                                  $rootScope.$broadcast(APP_EVENTS.LOGIN_FAILED);
                                  $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                                  $scope.authError = true;
                                });
        },
        signup : function() {
          var modalInstance = $uibModal.open({
                                templateUrl: 'app/signup/signup-template.html',
                                controller: 'SignupController',
                                resolve: {

                                }
                              });
                              modalInstance.result.then(function (selectedItem) {
                                $scope.selected = selectedItem;
                              });
        }
      };
    }]);
})();
