(function () {
angular.module('notinphillyServerApp')
  .controller('AdminEditUserController', [ '$scope', '$uibModal', function($scope, $uibModal) {
    $scope.save = function(){
      if(!$scope.userForm.$invalid)
      {
        if ($scope.addressDetails)
        {
          var address = $scope.addressDetails;

          $scope.User.zip = address.postalCode;
          $scope.User.city = address.city;
          $scope.User.stateName = address.state;
          $scope.User.streetName = address.streetName;
          $scope.User.streetNumber = address.streetNumber;
          $scope.User.addressLocation = address.location;
        }

        $http.post('/api/users/' + $scope.User._id, $scope.User).
                success(function(data) {

                }).error(function(err) {
                    
                });
      }
    }

    $scope.close = function(){
      $uibModalInstance.dismiss('cancel');
    }
  }]);
})();
