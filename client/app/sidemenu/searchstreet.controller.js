(function () {
  angular.module('notinphillyServerApp')
    .controller('SearchStreetController', [ '$scope', '$http', '$rootScope', 'sessionService', function($scope, $http, $rootScope, sessionService) {
      $scope.zipCodes = [];
      $scope.zipCode = undefined;

      $scope.streetNames = [];
      $scope.streetName = undefined;

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
    }]);
})();
