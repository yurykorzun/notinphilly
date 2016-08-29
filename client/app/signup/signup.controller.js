(function () {
  angular.module('notinphillyServerApp')
    .controller('SignupController', [ '$scope', '$location', '$http', "$uibModalInstance", function($scope, $location, $http, $uibModalInstance) {
      $scope.addressOptions = { country: 'us'};
      $scope.User = {};
      $scope.addressDetails = undefined;

      $scope.$watch(function() { return $scope.addressDetails; }, function(searchDetails) {

      });

      $scope.register = function(){
        if(!$scope.signinForm.$invalid)
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

          $http.post('/api/users/', $scope.User).
                  success(function(data) {
                      $scope.isRegisterFailed = false;
                      $scope.isRegisterSuccess = true;
                      $location.path('/');
                  }).error(function(err) {
                      $scope.errorMessage = err;
                      $scope.isRegisterFailed = true;
                      $scope.isRegisterSuccess = false;
                  });
        }
      }

      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      }
    }]);
})();
