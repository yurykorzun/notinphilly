(function () {
  angular.module('notinphillyServerApp')
    .controller('ResetPasswordController', [ '$scope', '$http', '$rootScope', '$uibModalInstance', 'sessionService', 'APP_EVENTS', function($scope, $http, $rootScope, $uibModalInstance, sessionService, APP_EVENTS) {
      $scope.resetPassword = {
        email: undefined,
        reset: function()
        {
          if(!$scope.resetPasswordForm.$invalid)
          {
            $http.post('/api/users/resetPassword', { email: $scope.resetPassword.email }).
                    success(function(data) {
                        $scope.isResetFailed = false;
                        $scope.isResetSuccess = true;
                        $location.path('/');
                    }).error(function(err) {
                        $scope.errorMessage = err;
                        $scope.isResetFailed = true;
                        $scope.isResetSuccess = false;
                    });
          }
        },
        close: function()
        {
          $uibModalInstance.dismiss('cancel');
        }
      };
    }]);
})();
