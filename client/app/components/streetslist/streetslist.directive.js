'use strict';

(function () {
  angular.module('notinphillyServerApp').directive('streetsList', ['$rootScope', '$location', 'mapService', 'APP_EVENTS', 'APP_CONSTS', function($rootScope, $location, mapService, APP_EVENTS, APP_CONSTS) {
    return {
      restrict: 'E',
      scope: {
        streetsAll: '=',
        streetsShow: '='
      },
      controller: ['$scope', function($scope) {
        $scope.chooseStreet = function(streetId) {
          mapService.showStreets($scope.streetsAll);          
          $location.path("map/" + APP_CONSTS.MAPVIEW_STREETS_PATH + "/" + streetId);
        };
      }],
      link: function(scope, element, attributes){
      },
      templateUrl: "app/components/streetslist/streetslist-template.html"
    }
  }]);
})();
