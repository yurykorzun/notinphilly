(function () {
  angular.module('notinphillyServerApp')
    .controller('SignupController', [ '$scope', '$location', '$http', "$uibModalInstance", function($scope, $location, $http, $uibModalInstance) {
      $scope.zipCodes = [];
      $scope.zipCode = undefined;

      $scope.streetNames = [];
      $scope.streetName = undefined;
      $scope.User = {};
      $scope.refreshZipCodes = function(search) {
        if(search)
        {
          return $http.get('/api/streets/lookupZipcodes/' + search + "/" + 10)
                      .then(function(response) {
                          $scope.zipCodes = response.data;
                      });
        }
      };

      $scope.refreshStreetNames = function(search) {
        if(search)
        {
          return $http.get('/api/streets/lookupNames/' + search + "/" + 10)
                      .then(function(response) {
                          $scope.streetNames = response.data;
                      });
        }
      };

      $scope.register = function(){
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
      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      }
    }]);
})();
