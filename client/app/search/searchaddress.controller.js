(function () {
angular.module('notinphillyServerApp')
  .controller('searchAddressController', [ '$scope', '$http', '$rootScope', '$anchorScroll', '$location', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $anchorScroll, $location, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.options = { country: 'us'};
    $scope.streets = [];
    $scope.pagedStreets = [];

    $scope.streetsPage = 1;
    $scope.streetsPageSize = 4;
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
      mapService.showStreets($scope.streets, $scope.location);
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

        mapService.findStreetsNear($scope.location).then(function(searchResults)
        {
          $scope.streets = searchResults;
          setPagedStreets($scope.streets, $scope.streetsPage, $scope.streetsPageSize);
        });
      }
    };

    $scope.loadMore = function() {
      $scope.streetsPage++;
      setPagedStreets($scope.streets, $scope.streetsPage, $scope.streetsPageSize);
    }

    $scope.hasAddress = function() {
      var addressDetails = $scope.details;
      return addressDetails != undefined;
    };

    $scope.hasStreets = function(){
      return $scope.streets.length > 0;
    };

    var setPagedStreets = function(streets, page, pageSize)
    {
        var startIndex = ((page - 1) * pageSize);
        var endIndex = page * pageSize;
        endIndex = streets.length < endIndex ? streets.length : endIndex;

        var pagedStreets = streets.slice(startIndex, endIndex);

        $scope.pagedStreets = $scope.pagedStreets.concat(pagedStreets);
        $scope.hasMoreStreets = endIndex < streets.length;
    }
  }]);
})();
