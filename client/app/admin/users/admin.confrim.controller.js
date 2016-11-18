(function () {
angular.module('notinphillyServerApp')
  .controller('AdminConfirmController', [ '$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
    $scope.ok = function() {
      $uibModalInstance.close();
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  }]);
})();
