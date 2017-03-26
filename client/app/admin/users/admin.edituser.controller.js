(function () {
angular.module('notinphillyServerApp')
  .controller('AdminEditUserController', [ '$scope', '$http', '$uibModalInstance', function($scope, $http, $uibModalInstance) {
    $scope.User = $scope.$resolve.user;
    $scope.isExistingUser = ($scope.User["_id"] != undefined);

    $scope.roles = $scope.$resolve.roles;
    $scope.selectedRole = $scope.User.roles;
    $scope.rolesConfig = {
            valueField: '_id',
            labelField: 'name',
            placeholder: 'Select role'
          };

    if (!$scope.User.fullAddress)
    {
      $scope.User.fullAddress = $scope.User.address;
    }
    $scope.$watch(function() { return $scope.addressDetails; }, function(searchDetails) {
      if (searchDetails)
      {
        var address = searchDetails;

        $scope.User.zip = address.postalCode;
        $scope.User.city = address.city;
        $scope.User.stateName = address.state;
        $scope.User.streetName = address.streetName;
        $scope.User.streetNumber = address.streetNumber;
        $scope.User.addressLocation = address.location;
      }
    });

    $scope.save = function(){
      $scope.errorMessage = undefined;

      if(!$scope.userForm.$invalid)
      {
        if ($scope.isExistingUser)
        {
          $http.put('/api/users/' + $scope.User._id, $scope.User).
                  success(function(data) {
                    $uibModalInstance.close();
                  }).error(function(err) {
                    $scope.errorMessage = err;
                  });
        }
        else {
          $http.post('/api/users/', $scope.User).
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
