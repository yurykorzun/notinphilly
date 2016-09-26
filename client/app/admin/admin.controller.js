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
  }]);
})();
