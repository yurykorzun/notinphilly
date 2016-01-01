(function () {
  angular.module('notinphillyServerApp')
    .controller('SignupController', [ '$scope', '$http', function($scope, $http) {
      $scope.zipCodes = [];
      $scope.zipCode = undefined;

      $scope.streetNames = [];
      $scope.streetName = undefined;

      $scope.refreshZipCodes = function(search) {
        if(search)
        {
          return $http.get('/api/streets/lookupZipcodes/' + search)
                      .then(function(response) {
                          $scope.zipCodes = response.data;
                      });
        }
      };

      $scope.refreshStreetNames = function(search) {
        if(search)
        {
          return $http.get('/api/streets/lookupNames/' + search)
                      .then(function(response) {
                          $scope.streetNames = response.data;
                      });
        }
      };
    }]);
})();
