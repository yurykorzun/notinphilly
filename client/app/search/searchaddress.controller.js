(function () {
angular.module('notinphillyServerApp')
  .controller('searchAddressController', [ '$scope', '$http', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $uibModal, $cookies, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.options = { country: 'us'};

    $scope.findStreet = function() {
      var addressDetails = $scope.details;
      if(addressDetails && addressDetails.geometry)
      {
        var location = addressDetails.geometry.location;
        location = { lat: location.lat(), lng: location.lng() };
      }
    };

    $scope.isValidForSearch = function() {
      var addressDetails = $scope.details;
      return addressDetails != undefined;
    };
  }]);
})();
