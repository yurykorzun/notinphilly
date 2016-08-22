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
          if ($scope.addressDetails && $scope.addressDetails.address_components)
          {
            var address = extractAddress($scope.addressDetails);

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

      function extractAddress(addressDetails)
      {
        var location = {
          lat: $scope.addressDetails.geometry.location.lat(),
          lng: $scope.addressDetails.geometry.location.lng()
        };
        var address = {
          streetNumber: getAddressComponent(addressDetails, 'street_number', 'short'),
          streetName: getAddressComponent(addressDetails, 'route', 'short'),
          city: getAddressComponent(addressDetails, 'locality', 'short'),
          state: getAddressComponent(addressDetails, 'administrative_area_level_1', 'short'),
          postalCode: getAddressComponent(addressDetails, 'postal_code', 'short'),
          country: getAddressComponent(addressDetails, 'country', 'short'),
          location: location
        };

        return address;
      }

      function getAddressComponent(address, component, type) {
        var element = null;
        angular.forEach(address.address_components, function (address_component) {
          if (address_component.types[0] == component) {
            element = (type == 'short') ? address_component.short_name : address_component.long_name;
          }
        });

        return element;
      }
    }]);
})();
