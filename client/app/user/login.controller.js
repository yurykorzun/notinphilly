(function () {
  angular.module('notinphillyServerApp')
    .controller('LoginController', [ '$scope', '$http', '$rootScope', '$uibModal', '$cookies', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $uibModal, $cookies, sessionService, APP_EVENTS, APP_CONSTS) {
      var adoptStreetFromCache = function() {
          var cachedStreet = $cookies.getObject(APP_CONSTS.ADOPTED_STREET);
                  if (cachedStreet)
                  {
                    $http.get("api/streets/adopt/" + cachedStreet.streetId).then(function(response) {
                      $cookies.remove(APP_CONSTS.ADOPTED_STREET);
                    });
                  }
      };

      $scope.loginForm = {
        login : function(form) {
          $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
          sessionService.login(form.email,
                               form.password)
                               .then(function(response){
                                  adoptStreetFromCache();

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
        resetPassword: function()
        {
          var modalInstance = $uibModal.open({
                                 templateUrl: 'app/signup/password-reset.html',
                                 controller: 'ResetPasswordController',
                                 resolve: {

                                 }
                               });
                               modalInstance.result.then(function () {
                               });
        }
      };
    }]);
})();
