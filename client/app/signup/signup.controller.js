(function() {
  angular.module('notinphillyServerApp').controller('SignupController', [
    '$rootScope',
    '$scope',
    '$location',
    '$http',
    '$cookies',
    '$uibModalInstance',
    'placeSearchService',
    'sessionService',
    'APP_EVENTS',
    'APP_CONSTS',
    function(
      $rootScope,
      $scope,
      $location,
      $http,
      $cookies,
      $uibModalInstance,
      placeSearchService,
      sessionService,
      APP_EVENTS,
      APP_CONSTS
    ) {
      $scope.addressOptions = { country: 'us' };
      $scope.User = {
        status: 1
      };
      $scope.addressDetails = undefined;

      var foundStreet = $cookies.getObject(APP_CONSTS.FOUND_STREET);
      if (foundStreet && foundStreet.placeId) {
        placeSearchService
          .getAddressByPlaceId(foundStreet.placeId)
          .then(function(addressDetails) {
            $scope.User.fullAddress = foundStreet.fullAddress;
            $scope.addressDetails = addressDetails;
          });
      }

      $scope.addressChange = function() {
        $scope.addressDetails = undefined;
      };

      $scope.register = function() {
        if (!$scope.signinForm.$invalid) {
          $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
          $http
            .post('/api/users/', $scope.User)
            .success(function(data) {
              $scope.isRegisterFailed = false;
              $scope.isRegisterSuccess = true;
              $scope.User.status += 1;
            })
            .error(function(err) {
              $scope.errorMessage = err
                ? err
                : 'Something went wrong, please try again later. ';
              $scope.isRegisterFailed = true;
              $scope.isRegisterSuccess = false;
            })
            .then(function() {
              return sessionService.login(
                $scope.User.email,
                $scope.User.password
              );
            })
            .then(function () {
              $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
              $scope.authError = false;
            });
        }
      };

      $scope.updateAccount = function() {
        if (!$scope.accountForm.$invalid) {
          if ($scope.addressDetails) {
            var address = $scope.addressDetails;

            $scope.User.zip = address.postalCode;
            $scope.User.city = address.city;
            $scope.User.stateName = address.state;
            $scope.User.streetName = address.streetName;
            $scope.User.streetNumber = address.streetNumber;
            $scope.User.addressLocation = address.location;
            $scope.User.fullAddress = address.fullAddress;
            $scope.User._id = $rootScope.currentUser._id;

            $http
              .put('/api/users/', $scope.User)
              .success(function(data) {
                // Update user status
                $scope.User.status += 1;
                // Close modal
                $scope.close();
                // Broadcast login success
                $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
              })
              .error(function(err) {
                $scope.errorMessage = err
                  ? err
                  : 'Something went wrong, please try again later. ';
              });
          } else {
            $scope.errorMessage =
              'Provided address is invalid, please make sure you use autocomplete';
          }
        }
      };

      $scope.close = function() {
        $uibModalInstance.dismiss('cancel');
      };
    }
  ]);
})();
