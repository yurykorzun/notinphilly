(function () {
  angular.module('notinphillyServerApp')
    .service('sessionService', ['$http', '$rootScope', function($http, $rootScope) {

      this.login = function(username, password, successCallback, failCallback) {
        $http.post("/api/auth/login",
        {
          "username": username,
          "password": password
        }).then(function(response)
        {
          $rootScope.currentUser = response.data;
          if(successCallback)
          {
            successCallback(response.data);
          }
        },
        function(err)
        {
          if(failCallback)
          {
            failCallback(err);
          }
        });
      };

      this.logout = function() {
        $http.post("/api/auth/logout")
        .then(function(response)
        {
          $rootScope.currentUser = null;
        });
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

      this.checkSession = function(successCallback) {
        $http.get("/api/auth/checkauth")
        .then(function(response)
        {
          if(response.data.authenticated && successCallback)
          {
            successCallback();
          }
        },
        function(err){
          $rootScope.currentUser = null;
        });
      };

      this.checkSession(this.session);
    }]);
  })();
