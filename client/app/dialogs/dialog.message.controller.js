(function () {
    angular.module('notinphillyServerApp')
      .controller('DialogMessageController', [ '$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
        $scope.messageHeader = $scope.$resolve.messageHeader;
        $scope.messageBody = $scope.$resolve.messageBody;
        $scope.acceptMessage = $scope.$resolve.acceptMessage;
        
        $scope.ok = function() {
          $uibModalInstance.close();
        };
      }]);
    })();
    