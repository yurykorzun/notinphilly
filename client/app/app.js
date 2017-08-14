(function () {
  var  app = angular.module('notinphillyServerApp', [
      'ngRoute',
      'ui.bootstrap',
      'ngAnimate',
      'ngCookies',
      'ui.mask',
      'ngSanitize',
      'selectize',
      'angularSpinner',
      'ui.grid',
      'ui.grid.pagination',
      'ui.grid.resizeColumns',
      'ui.tinymce'
    ])

    app.constant("APP_EVENTS", {
        "SPINNER_START": "spinnerStart",
        "SPINNER_END": "spinnerEnd",
        "LOGIN_SUCCESS": "loginSuccess",
        "LOGIN_FAILED": "loginFailed",
        "LOGOUT": "logout",
        "OPEN_SEARCH": "openSearch",
        "OPEN_EXPLORE": "openExplore",
        "OPEN_LOGIN": "openLogin",
        "OPEN_PROFILE": "openProfile",        
        "ENTER_NEIGBORHOOD_LEVEL": "enterNeigborhoodLevel",
        "ENTER_STREET_LEVEL": "enterStreetLevel",
        "STREET_ADOPTED": "streetAdopted",
        "STREET_LEFT": "streetLeft"
    });

  app.constant("APP_CONSTS", {
    "FOUND_STREET": "notinphilly.foundStreet",
    "ADOPTED_STREET": "notinphilly.adoptedStreet"
  });

    app.config(['$httpProvider', '$routeProvider', '$locationProvider', '$logProvider', '$provide', 
              function ($httpProvider, $routeProvider, $locationProvider, $logProvider, $provide) {
                $httpProvider.defaults.withCredentials = true;
                $httpProvider.interceptors.push('LoadingInterceptor');

                $routeProvider
                  .when('/', {
                    templateUrl: 'app/user/userprofile-template.html',
                    resolve:{
                      "check":function($location, sessionService) {
                        sessionService.checkLoggedin().then(function() {},
                            function() {
                                $location.path("/search");
                            });
                      }
                  }
                  })
                  .when('/search', {
                    templateUrl: 'app/search/searchaddress-template.html'
                  })
                  .when('/map', {
                    templateUrl: 'app/map/map-template.html'
                  })
                  .when('/map', {
                    templateUrl: 'app/map/map-template.html'
                  })
                  .when('/map/location/:lat/:lng', {
                    templateUrl: 'app/map/map-template.html'
                  })
                  .when('/profile', {
                    templateUrl: 'app/user/userprofile-template.html',
                    resolve: {
                      "check": function($location, sessionService) {
                        sessionService.checkLoggedin().then(function() {},
                            function() {
                                $location.path("/login");
                            });
                      }
                    }
                  })
                  .when('/profile1', {
                    templateUrl: 'app/user/userprofilenew-template.html',
                    resolve: {
                      "check": function($location, sessionService) {
                        sessionService.checkLoggedin().then(function() {},
                            function() {
                                $location.path("/login");
                            });
                      }
                    }
                  })
                  .when('/login', {
                    templateUrl: 'app/user/login-template.html'
                  })
                  .when('/calendar', {
                    templateUrl: 'app/social/calendar-template.html'
                  })
                  .when('/social', {
                    templateUrl: 'app/social/social-template.html'
                  })
                  .when('/media', {
                    templateUrl: 'app/info/media-template.html'
                  })
                  .when('/faq', {
                    templateUrl: 'app/info/faq-template.html'
                  })
                  .otherwise({
                    redirectTo: '/'
                  });

              $provide.decorator('$exceptionHandler', ['$delegate',
                function($delegate) {
                  return function(exception, cause) {
                    $delegate(exception, cause);
                  };
                }
              ]);

              $logProvider.debugEnabled(false);

              $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
              });
  }]);

 app.service('LoadingInterceptor', ['$q', '$rootScope', 'usSpinnerService',
  function ($q, $rootScope, usSpinnerService) {
      'use strict';
   
      var xhrCreations = 0;
      var xhrResolutions = 0;
   
      function isLoading() {
          return xhrResolutions < xhrCreations;
      }
   
      function updateStatus() {
          if (isLoading())
          {
            usSpinnerService.spin('mainSpinner');
          }
          else
          {
            usSpinnerService.stop('mainSpinner');
          }
      }
   
      return {
          request: function (config) {
              xhrCreations++;
              updateStatus();
              return config;
          },
          requestError: function (rejection) {
              xhrResolutions++;
              updateStatus();
              return $q.reject(rejection);
          },
          response: function (response) {
              xhrResolutions++;
              updateStatus();
              return response;
          },
          responseError: function (rejection) {
              xhrResolutions++;
              updateStatus();
              return $q.reject(rejection);
          }
      };
  }]);

  app.run([
    '$rootScope',
    function($rootScope) {

    }
  ]);
})();
