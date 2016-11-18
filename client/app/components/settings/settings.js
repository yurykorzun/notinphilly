(function () {
  angular.module('notinphillyServerApp')
    .service('settingsService', ['$http', '$q', 'APP_CONSTS', function($http, $q, APP_CONSTS) {
      this.getMapSettings = function()
      {
        var deferredSettings = $q.defer();
        $http.get("api/external/mapbox-map-credentials/").then(function(response) {
          deferredSettings.resolve({
                                      mapId: response.data.mapId,
                                      accessToken: response.data.apiKey,
                                      center: APP_CONSTS.MAP_CENTER,
                                      zoom: 13,
                                      zoomControl: false
                                  });
        },
        function(err) {
          deferredSettings.reject();
        });

        return deferredSettings.promise;
      }
    }]);
  })();
