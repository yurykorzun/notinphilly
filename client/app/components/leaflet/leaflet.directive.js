(function () {
  angular.module('notinphillyServerApp').directive('leaflet',  ['$window', '$rootScope', 'mapService', 'settingsService', 'APP_CONSTS', function ($window, $rootScope, mapService, settingsService, APP_CONSTS) {
  return {
    restrict: 'E',
    scope: {},
    replace: true,
    template: '<div></div>',
    controller: function($scope) {

    },
    link: function(scope, element, attributes){
      settingsService.getMapSettings().then(function(settings) {
        scope.mapId =  attributes.id;
        $(element).attr("id", scope.mapId);

        var map =  L.mapbox.map(scope.mapId, settings.mapId, settings);

        mapService.setMap(map);
      });
    }
  }
 }]);
})();
