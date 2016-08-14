(function () {
angular.module('notinphillyServerApp')
  .controller('AdminController', [ '$scope', 'sessionService', '$uibModal', function($scope, sessionService, $uibModal) {
    sessionService.checkLoggedin()
                  .then(function() {
                    $scope.isUserAdmin = sessionService.isAdmin();
                  },
                  function() {
                    $scope.isUserAdmin = false;
                  });

    $scope.addUser = function () {
      $uibModal.open({
        templateUrl: 'app/signup/signup-template.html',
        controller: 'SignupController'
      });
    }
  }]);
})();
