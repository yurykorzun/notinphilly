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
        settingsService.getSettings().then(function(settings) {
          scope.mapId =  attributes.id;
          $(element).attr("id", scope.mapId);

          var map =  L.mapbox.map(scope.mapId, settings.MAP_BOX_MAP_ID, {
            accessToken: settings.MAP_BOX_API_KEY,
            center: APP_CONSTS.MAP_CENTER,
            zoom: 13,
            zoomControl: false
          });

          mapService.setMap(map);
        });
      }
    };
  }]);
})();
