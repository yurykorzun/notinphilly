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
        "STREET_LEFT": "streetLeft",
        "MESSAGE_SENT": "messageSent",
        "MESSAGE_REMOVED": "messageRemoved",
        "CONTACT_APPROVED": "contactApproved",        
        "CONTACT_REJECTED": "contactRejected",        
        "CONTACT_REMOVED": "contactRejected"
    });

  app.constant("APP_CONSTS", {
    "FOUND_STREET": "notinphilly.foundStreet",
    "ADOPTED_STREET": "notinphilly.adoptedStreet",
    "MAPVIEW_RESOLVE": "mapView",   
    "MAPVIEW_DEFAULT_PATH": "default",         
    "MAPVIEW_LOCATION_PATH": "location",        
    "MAPVIEW_CURRENTUSER_PATH": "currentUser",  
    "MAPVIEW_STREETS_PATH": "streets",        
  });

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

  app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
      var original = $location.path;
      $location.path = function (path, reload) {
          if (reload === false) {
              var lastRoute = $route.current;
              var un = $rootScope.$on('$locationChangeSuccess', function () {
                  $route.current = lastRoute;
                  un();
              });
          }
          return original.apply($location, [path]);
      };
    }
  ]);

  app.config(['$httpProvider', '$routeProvider', '$locationProvider', '$logProvider', '$provide', 'APP_CONSTS',
      function ($httpProvider, $routeProvider, $locationProvider, $logProvider, $provide, APP_CONSTS) {
          $httpProvider.defaults.withCredentials = true;
          $httpProvider.interceptors.push('LoadingInterceptor');

          var checkAuthentication = function($location, sessionService) {
            sessionService.checkLoggedin().then(function() {},
                function() {
                    $location.path("/search");
                });
          };

          $routeProvider
            .when('/', {
              templateUrl: 'app/user/userprofilenew-template.html',
              resolve:{
                "check": checkAuthentication
            }
            })
            .when('/admin', {
              templateUrl: 'app/admin/admin-template.html',
              controller: 'AdminController',
              resolve:{
                "check": checkAuthentication
            }
            })
            .when('/search', {
              templateUrl: 'app/search/searchaddress-template.html'
            })
            .when('/map', {
              templateUrl: 'app/map/explore-map-template.html',
              controller: 'ExploreMapController',
              resolve: {
                resolveParams: function( ) {
                  return {
                    mapView: function( ) {
                      return APP_CONSTS.MAPVIEW_DEFAULT_PATH;
                    }
                  };
              }}
            })
            .when('/map/' + APP_CONSTS.MAPVIEW_CURRENTUSER_PATH + '/', {
              templateUrl: 'app/map/explore-map-template.html',
              controller: 'ExploreMapController',
              resolve: {
                resolveParams: function( ) {
                  return {
                    mapView: function( ) {
                      return APP_CONSTS.MAPVIEW_CURRENTUSER_PATH;
                    }
                  };
              }}
            })
            .when('/map/' + APP_CONSTS.MAPVIEW_CURRENTUSER_PATH + '/:streetId', {
              templateUrl: 'app/map/explore-map-template.html',
              controller: 'ExploreMapController',
              resolve: {
                resolveParams: function( ) {
                  return {
                    mapView: function( ) {
                      return APP_CONSTS.MAPVIEW_CURRENTUSER_PATH;
                    }
                  };
              }}
            })
            .when('/map/' + APP_CONSTS.MAPVIEW_LOCATION_PATH + '/:lat/:lng', {
              templateUrl: 'app/map/explore-map-template.html',
              controller: 'ExploreMapController',
              resolve: {
                resolveParams: function( ) {
                  return {
                    mapView: function( ) {
                      return APP_CONSTS.MAPVIEW_LOCATION_PATH;
                    }
                  };
              }}
            })
            .when('/map/' + APP_CONSTS.MAPVIEW_LOCATION_PATH + '/:lat/:lng/:streetId', {
              templateUrl: 'app/map/explore-map-template.html',
              controller: 'ExploreMapController',
              resolve: {
                resolveParams: function( ) {
                  return {
                    mapView: function( ) {
                      return APP_CONSTS.MAPVIEW_LOCATION_PATH;
                    }
                  };
              }}
            })
            .when('/profile', {
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
            .when('/profile1', {
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
            .when('/login', {
              templateUrl: 'app/user/login-template.html',
              resolve: {
                "check": function($location, sessionService) {
                  sessionService.checkLoggedin().then(function() {
                    $location.path("/profile");
                  },
                  function() {
                      
                  });
                }
              }
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
            .when('/resources', {
              templateUrl: 'app/info/resources-template.html'
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
})();
