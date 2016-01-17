(function () {
  angular.module('notinphillyServerApp').directive('leaflet',  ['$window', '$rootScope', 'mapService', 'APP_EVENTS', function ($window, $rootScope, mapService, APP_EVENTS) {
  return {
    restrict: 'E',
    scope: {},
    replace: true,
    template: '<div></div>',
    controller: function($scope) {

    },
    link: function(scope, element, attributes){
      scope.mapId =  attributes.id;
      $(element).attr("id", scope.mapId);

      var map = new L.Map(scope.mapId, {
          center: APP_EVENTS.MAP_CENTER,
          zoom: 13,
          zoomControl: false
      });

      L.tileLayer('http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}', {
        detectRetina: true,
        apikey: 'pk.eyJ1IjoieXVyeWtvcnp1biIsImEiOiJjaWY2eTN2aHMwc3VncnptM3QxMzU3d3hxIn0.Mt0JldEMvvTdWW4GW2RSlQ',
        mapid: 'yurykorzun.nljndeg0'
      }).addTo(map);

      mapService.setMap(map);
    }
  }
 }]);
})();
