(function () {
angular.module('notinphillyServerApp')
  .controller('AdminEditRequestController', [ '$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance) {
    $scope.inventory = $scope.$resolve.request;
    $scope.statuses = [];

    $scope.save = function(){
      $scope.errorMessage = undefined;

      $http.put('/api/toolrequests/status/' + $scope.Inventory.user._id + '/' + $scope.Inventory.status._id).
              success(function(data) {
                $uibModalInstance.close();
              }).error(function(err) {
                $scope.errorMessage = err;
              });
    }

    $scope.close = function(){
      $uibModalInstance.dismiss('cancel');
    }

    $scope.onStatusChange = function(item, model) {

    }
  }]);
})();
