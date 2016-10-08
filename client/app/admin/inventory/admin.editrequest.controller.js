(function () {
angular.module('notinphillyServerApp')
  .controller('AdminEditRequestController', [ '$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance) {
    $scope.toolRequest = $scope.$resolve.request;
    $scope.user = $scope.toolRequest.user;
    $scope.tool = $scope.toolRequest.tool;

    $scope.selectedStatus = $scope.toolRequest.status._id;
    $scope.statusConfig = {
            valueField: '_id',
            labelField: 'name',
            placeholder: 'Select status',
            maxItems: 1
          };
    $scope.statuses = $scope.$resolve.statuses;

    $scope.save = function(){
      $scope.errorMessage = undefined;

      $http.post('/api/toolrequests/status/', { id: $scope.toolRequest._id, status: $scope.selectedStatus }).
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
