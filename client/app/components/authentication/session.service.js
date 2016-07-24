(function () {
  angular.module('notinphillyServerApp')
    .service('sessionService', ['$http', '$rootScope', '$q', function($http, $rootScope, $q) {

      this.login = function(email, password) {
        var deferred = $q.defer();

        $http.post("/api/auth/login",
        {
          "email": email,
          "password": password
        }).then(function(response)
        {
          $rootScope.currentUser = response.data;
          deferred.resolve(response.data);
        },
        function(err)
        {
          deferred.reject(err);
        });

        return deferred.promise;
      };

      this.logout = function() {
        var deferred = $q.defer();

        $http.post("/api/auth/logout")
        .then(function(response)
        {
          $rootScope.currentUser = null;
          deferred.resolve(response);
        },
        function (err){
          deferred.reject(err);
        });

        return deferred.promise;
      };

      this.session = function() {
        $http.get("/api/auth/session")
        .then(function(response)
        {
          $rootScope.currentUser = response.data;
        },
        function(err){
          $rootScope.currentUser = null;
        });
      };

      this.checkLoggedin = function() {
        var deferred = $q.defer();

        $http.get("/api/auth/islogged")
        .then(function(response)
        {
          if(response.data.authenticated)
          {
            $rootScope.currentUser = response.data.user;
            deferred.resolve(response.data);
          }
          else {
            $rootScope.currentUser = null;
            deferred.reject(response.data);
          }
        },
        function(err){
          $rootScope.currentUser = null;
          deferred.reject(err);
        });

        return deferred.promise;
      };

      this.isAdmin = function() {
        if($rootScope.currentUser && $rootScope.currentUser.isAdmin)
        {
          return true;
        }

        return false;
      };

    }]);
  })();
