'use strict';

(function () {
  angular.module('notinphillyServerApp').directive('streetsList', ['$rootScope', 'mapService', 'APP_EVENTS', function($rootScope, mapService, APP_EVENTS) {
    return {
      restrict: 'E',
      scope: {
        streetsAll: '=',
        streetsShow: '='
      },
      controller: ['$scope', function($scope) {
        $scope.chooseStreet = function(streetId) {
          mapService.showStreets($scope.streetsAll);          
          mapService.selectStreet(streetId);
          $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
        };
      }],
      link: function(scope, element, attributes){
      },
      templateUrl: "app/components/streetslist/streetslist-template.html"
    }
  }]);
})();
