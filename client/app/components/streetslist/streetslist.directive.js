'use strict';

(function () {
  angular.module('notinphillyServerApp').directive('streetsList', ['$rootScope', '$location', 'mapService', 'APP_EVENTS', 'APP_CONSTS', function($rootScope, $location, mapService, APP_EVENTS, APP_CONSTS) {
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
                $location.path("/map/" + APP_CONSTS.MAPVIEW_LOCATION_PATH + "/" + $scope.searchLocation.lat + "/" + $scope.searchLocation.lng + "/" + streetId);
            }
            else
            {
                $location.path("map/" + APP_CONSTS.MAPVIEW_CURRENTUSER_PATH + "/" + streetId);  
            }
        };
      }],
      link: function(scope, element, attributes){
      },
      templateUrl: "app/components/streetslist/streetslist-template.html"
    }
  }]);
})();
