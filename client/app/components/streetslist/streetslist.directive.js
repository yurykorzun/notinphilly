'use strict';

(function () {
  angular.module('notinphillyServerApp').directive('streetslist', ['$rootScope', 'mapService', 'APP_EVENTS', function($rootScope, mapService, APP_EVENTS) {
    return {
      restrict: 'E',
      scope: {
        streets: '='
      },
      controller: function($scope) {
        $scope.chooseStreet = function(streetId) {
          mapService.showStreets($scope.streets);
          mapService.selectStreet(streetId);
          $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
        };
      },
      templateUrl: "app/components/streetslist/streetslist-template.html"
    }
  }]);
})();
