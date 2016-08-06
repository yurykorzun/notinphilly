(function () {
angular.module('notinphillyServerApp')
  .controller('searchAddressController', [ '$scope', '$http', '$rootScope', '$anchorScroll', '$location', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $anchorScroll, $location, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.options = { country: 'us'};
    $scope.streets = [];
    $scope.streetsPage = 1;
    $scope.streetsSkip = 4;
    $scope.hasMoreStreets = false;
    $scope.location = undefined;

    $scope.$on('$locationChangeStart', function(ev) {
      ev.preventDefault();
    });

    $scope.$watch(function() { return $scope.details; }, function(searchDetails) {
      if(searchDetails)
      {
        $scope.findStreet();
      }
      else {
        $scope.clearSearch();
      }
    });

    $scope.switchToMap = function() {
      $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
    }

    $scope.clearSearch = function() {
      $scope.details = $scope.autocomplete = undefined;
      $scope.streets = [];
      mapService.setNeighborhoodLayers();
    };

    $scope.findStreet = function() {
      var addressDetails = $scope.details;
      if(addressDetails && addressDetails.geometry)
      {
        $scope.location = addressDetails.geometry.location;
        $scope.location = { lat: $scope.location.lat(), lng: $scope.location.lng() };

        mapService.findStreetsNear($scope.location, $scope.streetsPage, $scope.streetsSkip).then(function(searchResults){
          $scope.streets = searchResults.streets;
          $scope.hasMoreStreets = searchResults.total > 0;
          $scope.streetsPage = searchResults.page;
        });
      }
    };

    $scope.hasAddress = function() {
      var addressDetails = $scope.details;
      return addressDetails != undefined;
    };

    $scope.hasStreets = function(){
      return $scope.streets.length > 0;
    };
  }]);
})();
