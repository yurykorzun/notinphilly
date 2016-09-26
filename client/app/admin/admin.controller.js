(function () {
angular.module('notinphillyServerApp')
  .controller('AdminController', [ '$scope', 'sessionService', '$uibModal', function($scope, sessionService, $uibModal) {
    $scope.tabs = {
      isUsersActive: true,
      isInventoryActive: false
    };

    $scope.tabs.showUsers = function() {
        $scope.tabs.isUsersActive = true;
        $scope.tabs.isInventoryActive = false;
    };

    $scope.tabs.showInventory = function() {
        $scope.tabs.isInventoryActive = true;
        $scope.tabs.isUsersActive = false;
    };

    sessionService.checkLoggedin()
                  .then(function() {
                    $scope.isUserAdmin = sessionService.isAdmin();
                  },
                  function() {
                    $scope.isUserAdmin = false;
                  });
  }]);
})();
