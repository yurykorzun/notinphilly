(function () {
angular.module('notinphillyServerApp')
  .controller('searchAddressController', [ '$scope', '$http', '$rootScope', '$anchorScroll', '$location', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $anchorScroll, $location, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.options = { country: 'us'};
    $scope.streets = [];
    $scope.pagedStreets = [];

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
      $scope.pagedStreets = $scope.streets = [];
      $scope.streetsPage = 1;
      mapService.setNeighborhoodLayers();
    };

    $scope.findStreet = function() {
      var addressDetails = $scope.details;
      if(addressDetails && addressDetails.geometry)
      {
        $scope.location = addressDetails.geometry.location;
        $scope.location = { lat: $scope.location.lat(), lng: $scope.location.lng() };

        mapService.findStreetsNear($scope.location).then(function(searchResults){
          $scope.streets = searchResults;
          $scope.totalStreets = searchResults.length;
          setPagedStreets($scope.streets);
        });
      }
    };

    $scope.loadMore = function() {
      $scope.streetsPage++;
      setPagedStreets($scope.streets);
    }

    $scope.hasAddress = function() {
      var addressDetails = $scope.details;
      return addressDetails != undefined;
    };

    $scope.hasStreets = function(){
      return $scope.streets.length > 0;
    };

    var setPagedStreets = function(streets)
    {
        var startIndex = (($scope.streetsPage - 1) * $scope.streetsSkip);
        var endIndex = $scope.streetsPage * $scope.streetsSkip;
        endIndex = streets.length < endIndex ? streets.length : endIndex;

        var pagedStreets = streets.slice(startIndex, endIndex);
        $scope.pagedStreets = $scope.pagedStreets.concat(pagedStreets);
        $scope.hasMoreStreets = endIndex < streets.length;
    }
  }]);
})();
