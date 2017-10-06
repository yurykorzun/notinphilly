'use strict';

(function () {
  angular.module('notinphillyServerApp').directive('streetsList', ['$rootScope', '$state', 'mapService', 'APP_EVENTS', 'APP_CONSTS', function($rootScope, $state, mapService, APP_EVENTS, APP_CONSTS) {
    return {
      restrict: 'E',
      scope: {
        streetsAll: '=',
        streetsShow: '=',
        searchLocation: '='       
      },
      controller: ['$scope', 'mapService', function($scope, mapService) {
        $scope.chooseStreet = function(streetId) {
            if ($scope.searchLocation)
            {
                $state.go(APP_CONSTS.STATE_MAP_LOCATION_STREET, { lat: $scope.searchLocation.lat, lng: $scope.searchLocation.lng, streetId: streetId });
            }
            else
            {
                $state.go(APP_CONSTS.STATE_MAP_CURRENT_STREET, { streetId: streetId });  
            }
        };
      }],
      link: function(scope, element, attributes){
      },
      templateUrl: "app/components/streetslist/streetslist-template.html"
    }
  }]);
})();
