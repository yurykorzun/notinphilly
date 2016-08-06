'use strict';

(function () {
  angular.module('notinphillyServerApp').directive('streetslist', ['$rootScope', 'mapService', 'APP_EVENTS', function($rootScope, mapService, APP_EVENTS) {
    return {
      restrict: 'E',
      scope: {
        streets: '=',
        hasMoreStreets: '=',
        streetsPage: '=',
        streetsSkip: '=',
        location: '='
      },
      controller: function($scope) {
        $scope.chooseStreet = function(streetId) {
          mapService.selectStreet(streetId);
          $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
        };

        $scope.loadMore = function() {
          $scope.streetsPage++;
          mapService.findStreetsNear($scope.location, $scope.streetsPage, $scope.streetsSkip).then(function(searchResults){
            $scope.streets.concat(searchResults.streets);
          });
        }
      },
      templateUrl: "app/components/streetslist/streetslist-template.html"
    }
  }]);
})();
