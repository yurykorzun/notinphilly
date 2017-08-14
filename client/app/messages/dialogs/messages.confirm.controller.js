(function () {
    angular.module('notinphillyServerApp')
      .controller('MessageConfirmController', [ '$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
        $scope.ok = function() {
          $uibModalInstance.close();
        };
    
        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      }]);
    })();
    