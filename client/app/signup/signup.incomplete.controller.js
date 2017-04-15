(function () {
  angular.module('notinphillyServerApp')
    .controller('SignupIncompleteController', [ '$scope', '$http', '$rootScope', '$location', '$cookies', '$uibModalInstance', 'placeSearchService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', 
                                            function($scope, $http, $rootScope, $location, $cookies, $uibModalInstance, placeSearchService, sessionService, APP_EVENTS, APP_CONSTS) {
      $scope.User = $scope.$resolve.user;
      $scope.addressDetails = undefined;

      var foundStreet = $cookies.getObject(APP_CONSTS.FOUND_STREET);
      if (foundStreet && foundStreet.placeId)
      {
        placeSearchService.getAddressByPlaceId(foundStreet.placeId).then(function (addressDetails) {
          $scope.User.fullAddress = foundStreet.fullAddress;
          $scope.addressDetails = addressDetails;
        });
      }

      $scope.addressChange = function() {
        $scope.addressDetails = undefined;
      }

      $scope.update = function(){
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
            $scope.User.fullAddress = address.fullAddress;
          }
          if ($scope.User.fullAddress && $scope.User.city && $scope.User.streetName && $scope.User.streetNumber)
          {
            $scope.User.needsCompletion = false;
            $http.put('/api/users/', $scope.User).
                    success(function(data) {
                        $scope.isUpdateFailed = false;
                        $scope.isUpdateSuccess = true;

                        if (foundStreet) $cookies.remove(APP_CONSTS.FOUND_STREET);

                        $location.path('/');
                    }).error(function(err) {
                        $scope.errorMessage = err ? err : "Something went wrong, please try again later. ";
                        $scope.isUpdateFailed = true;
                        $scope.isUpdateSuccess = false;
                    });
          }
          else
          {
            $scope.errorMessage = "Provided address is invalid, please make sure you use autocomplete";
            $scope.isUpdateFailed = true;
            $scope.isUpdateSuccess = false;
          }
        }
      }

      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      }
    }]);
})();
