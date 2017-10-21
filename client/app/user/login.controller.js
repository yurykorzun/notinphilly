(function () {
  angular.module('notinphillyServerApp')
    .controller('LoginController', 
                  ['$scope', '$http', '$rootScope', '$state', '$uibModal', '$cookies', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', 
          function($scope, $http, $rootScope, $state, $uibModal, $cookies, sessionService, APP_EVENTS, APP_CONSTS) {
            sessionService.checkLoggedin().then(function() {
              $state.go(APP_CONSTS.STATE_PROFILE);
            });
            
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
                sessionService.login(form.email,
                                    form.password)
                                    .then(function(response){
                                        adoptStreetFromCache();
                                        $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                                        $state.go(APP_CONSTS.STATE_PROFILE);
                                        $scope.authError = false;
                                      },
                                      function(err) {
                                        $rootScope.$broadcast(APP_EVENTS.LOGIN_FAILED);
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
