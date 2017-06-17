(function () {
  angular.module('notinphillyServerApp')
    .controller('SignupController', [ '$scope', '$location', '$http', '$cookies', '$uibModalInstance', 'placeSearchService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $location, $http, $cookies, $uibModalInstance, placeSearchService, APP_EVENTS, APP_CONSTS) {
      $scope.addressOptions = { country: 'us'};
      $scope.User = {};
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

      $scope.register = function(){
        if(!$scope.signinForm.$invalid)
        {
        
        $http.post('/api/users/', $scope.User).
            success(function(data) {
                $scope.isRegisterFailed = false;
                $scope.isRegisterSuccess = true;
                
                $location.path('/');
            }).error(function(err) {
                $scope.errorMessage = err ? err : "Something went wrong, please try again later. ";
                $scope.isRegisterFailed = true;
                $scope.isRegisterSuccess = false;
            });

          /*
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
            
            $http.post('/api/users/', $scope.User).
                    success(function(data) {
                        $scope.isRegisterFailed = false;
                        $scope.isRegisterSuccess = true;
                        
                        $location.path('/');
                    }).error(function(err) {
                        $scope.errorMessage = err ? err : "Something went wrong, please try again later. ";
                        $scope.isRegisterFailed = true;
                        $scope.isRegisterSuccess = false;
                    });
            }
            else
            {
              $scope.errorMessage = "Provided address is invalid, please make sure you use autocomplete";
              $scope.isRegisterFailed = true;
              $scope.isRegisterSuccess = false;
            }
            */
        }
      }

      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      }
    }]);
})();
