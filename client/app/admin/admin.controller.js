(function () {
angular.module('notinphillyServerApp')
  .controller('adminController', [ '$scope', 'sessionService', function($scope, sessionService) {
    sessionService.checkLoggedin()
                  .then(function() {
                    $scope.isUserAdmin = sessionService.isAdmin();
                  },
                  function() {
                    $scope.isUserAdmin = false;
                  });

  }]);
})();
