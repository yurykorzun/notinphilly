(function () {
  angular.module('notinphillyServerApp')
    .service('settingsService', ['$http', '$q', function($http, $q) {
      this.getSettings = function()
      {
        var deferredSettings = $q.defer();
        $http.get("api/settings/").then(function(response) {
          deferredSettings.resolve(response.data);
        },
        function(err) {
          deferredSettings.reject();
        });

        return deferredSettings.promise;
      }
    }]);
  })();
