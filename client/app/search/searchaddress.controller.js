(function () {
angular.module('notinphillyServerApp')
  .controller('searchAddressController', [ '$scope', '$http', '$rootScope', '$anchorScroll', '$location', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $anchorScroll, $location, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.options = { country: 'us'};
    $scope.foundStreets = [];

    $scope.$on('$locationChangeStart', function(ev) {
      ev.preventDefault();
    });

    var scrollToMap = function() {
       $anchorScroll('cityMap');
    }

    $scope.clearSearch = function() {
      $scope.details = $scope.autocomplete = undefined;
      $scope.foundStreets = [];
      //$rootScope.$broadcast(APP_EVENTS.ENTER_NEIGBORHOOD_LEVEL);
      mapService.setNeighborhoodLayers();
    };

    $scope.$watch(function() { return $scope.details; }, function(searchDetails) {
      if(searchDetails)
      {
        $scope.findStreet();
      }
      else {
        $scope.clearSearch();
      }
    });

    $scope.findStreet = function() {
      var addressDetails = $scope.details;
      if(addressDetails && addressDetails.geometry)
      {
        var location = addressDetails.geometry.location;
        location = { lat: location.lat(), lng: location.lng() };

        mapService.showAddressStreets(location).then(function(streets){
          $scope.foundStreets = streets;
        });

        //$rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
      }
    };

    $scope.chooseStreet = function(streetId) {
      mapService.selectStreet(streetId);
      scrollToMap();
    }

    $scope.hasAddress = function() {
      var addressDetails = $scope.details;
      return addressDetails != undefined;
    };

    $scope.hasStreets = function(){
      return $scope.foundStreets.length > 0;
    };
  }]);
})();
