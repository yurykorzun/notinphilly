(function () {
  angular.module('notinphillyServerApp')
    .service('settingsService', ['$http', '$q', 'APP_CONSTS', function($http, $q, APP_CONSTS) {
      this.getMapSettings = function()
      {
        var deferredSettings = $q.defer();
        $http.get("api/city/getGeoJSON").success(function(cityData, status) {
          var geoJsonLayer = L.geoJson(cityData);
          var layerBounds = geoJsonLayer.getBounds();
          var mapCenter = cityData.properties.center ? cityData.properties.center : layerBounds.getCenter();


          $http.get("api/external/mapbox-map-credentials/").then(function(response) {
            deferredSettings.resolve({
                                        mapId: response.data.mapId,
                                        accessToken: response.data.apiKey,
                                        center: mapCenter,
                                        zoom: 13,
                                        zoomControl: false
                                    });
          },
          function(err) {
            deferredSettings.reject();
          });
        });
       
        return deferredSettings.promise;
      }
    }]);
  })();
