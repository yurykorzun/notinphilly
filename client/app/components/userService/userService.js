(function () {
  angular.module('notinphillyServerApp')
    .service('mapService', ['$http', '$q', function($http, $q) {
      this.getUsers = function()
      {
        var deferredSettings = $q.defer();

        $http.get("api/users/").then(function(response) {
          deferredSettings.resolve(response.data);
        },
        function(err) {
          deferredSettings.reject();
        });

        return deferredSettings.promise;
      }
    }]);
})();
