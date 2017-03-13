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

        var map = L.map(scope.mapId, {
                          center: [settings.center.lng, settings.center.lat],
                          zoom: 13,
                          zoomControl: false
                        });

        L.tileLayer('https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            subdomains: ['a','b','c','d'],
            mapId: settings.mapId,
            accessToken: settings.accessToken
        }).addTo(map);

          mapService.setMap(map);
        });
      }
    };
  }]);
})();
