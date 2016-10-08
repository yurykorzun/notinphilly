(function () {
angular.module('notinphillyServerApp')
  .controller('AdminEditInventoryController', [ '$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance) {
    $scope.Inventory = $scope.$resolve.tool;
    $scope.isExistingTool = ($scope.Inventory["_id"] != undefined);

    $scope.save = function(){
      $scope.errorMessage = undefined;

      if (!$scope.inventoryForm.$invalid)
      {
        if ($scope.isExistingTool)
        {
          $http.put('/api/inventory/', $scope.Inventory).
                  success(function(data) {
                    $uibModalInstance.close();
                  }).error(function(err) {
                    $scope.errorMessage = err;
                  });
        }
        else {
          $http.post('/api/inventory/', $scope.Inventory).
                  success(function(data) {
                    $uibModalInstance.close();
                  }).error(function(err) {
                    $scope.errorMessage = err;
                  });
        }
      }
    }

    $scope.close = function(){
      $uibModalInstance.dismiss('cancel');
    }
  }]);
})();
