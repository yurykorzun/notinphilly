(function () {
  angular.module('notinphillyServerApp')
    .controller('StartPopupController', [ '$scope', '$http', '$rootScope', '$uibModalInstance', '$cookies', 'mapService', 'APP_EVENTS', function($scope, $http, $rootScope, $uibModalInstance, $cookies, mapService, APP_EVENTS) {
      $scope.zipCodes = [];
      $scope.zipCode = {};

      $scope.streetNames = [];
      $scope.streetName = {};

      $scope.errorShow = false;
      $scope.notFoundShow = false;

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

      $scope.findStreet = function() {
        var findStreetsUrl = '/api/streets/findstreets/' + $scope.streetName.selected.name + "/" + $scope.houseNumber;
        $http.get(findStreetsUrl)
                      .then(function(response) {
                        if(response.data.streets.length > 0)
                        {
                          var firstStreet = response.data.streets[0];

                          $rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
                          mapService.goToStreet(firstStreet._id);

                          $cookies.put(APP_EVENTS.FOUND_STREET, firstStreet._id);

                          $scope.streetName = {};
                          $scope.zipCode = {};
                          $scope.houseNumber = undefined;

                          $scope.errorShow = false;
                          $scope.notFoundShow = false;
                          $uibModalInstance.dismiss('cancel');
                        }
                        else {
                          $scope.errorShow = false;
                          $scope.notFoundShow = true;
                        }


                      }, function(err){
                        $scope.errorShow = true;
                        $scope.notFoundShow = false;
                      });
      };

      $scope.isValidForSearch = function() {
        if($scope.streetName && $scope.streetName.selected && $scope.houseNumber)
        {
          return true;
        }

        return false;
      };

      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      }
    }]);
})();
