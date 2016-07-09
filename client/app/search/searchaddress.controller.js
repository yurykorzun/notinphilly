(function () {
angular.module('notinphillyServerApp')
  .controller('searchAddressController', [ '$scope', '$http', '$rootScope', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.options = { country: 'us'};

    $scope.clearSearch = function() {
      $scope.details = $scope.autocomplete = undefined;
      $rootScope.$broadcast(APP_EVENTS.ENTER_NEIGBORHOOD_LEVEL);
      mapService.setNeighborhoodLayers();
    };

    $scope.findStreet = function() {
      var addressDetails = $scope.details;
      if(addressDetails && addressDetails.geometry)
      {
        var location = addressDetails.geometry.location;
        location = { lat: location.lat(), lng: location.lng() };

        mapService.showAddressStreets(location).then(function(streets){
          
        });

        //$rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
      }
    };

    $scope.chooseStreet = function() {

    }

    $scope.hasAddress = function() {
      var addressDetails = $scope.details;
      return addressDetails != undefined;
    };
  }]);
})();
