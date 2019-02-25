(function () {
  var  app = angular.module('notinphillyServerApp', [
      'ui.router',
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
    "STATE_DEFAULT": "main.default",
    "STATE_PROFILE": "main.userprofile",
    "STATE_LOGIN": "main.login",
    "STATE_ADMIN": "admin.dashboard",
    "STATE_MAP": "main.map",
    "STATE_MAP_CURRENT": "main.mapcurrent",
    "STATE_MAP_CURRENT_STREET": "main.mapcurrentstreet",
    "STATE_MAP_LOCATION": "main.maplocation",
    "STATE_MAP_LOCATION_STREET": "main.maplocationstreet",
    "STATE_SEARCH": "main.search",
    "STATE_SOCIAL": "main.social",
    "STATE_SPONSORS": "main.sponsors",
    "STATE_CALENDAR": "main.calendar",
    "STATE_MEDIA": "main.media",
    "STATE_FAQ": "main.faq",
    "STATE_RESOURCES": "main.resources",
	"STATE_PRIVACY": "privacy",
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

  app.run(['$rootScope', '$transitions', '$window', 'APP_CONSTS', function ($rootScope, $transitions, $window, APP_CONSTS) {
      $rootScope.APP_CONSTS = APP_CONSTS;

      $transitions.onStart( {}, function(trans) {
        var toState = trans.to();
      });
    }
  ]);

  app.config(['$httpProvider', '$stateProvider', '$locationProvider', '$urlRouterProvider', '$logProvider', '$provide', 'APP_CONSTS',
      function ($httpProvider, $stateProvider, $locationProvider, $urlRouterProvider, $logProvider, $provide, APP_CONSTS) {
          $httpProvider.defaults.withCredentials = true;
          $httpProvider.interceptors.push('LoadingInterceptor');

          $stateProvider.state('main', {
            abstract: true,
            controller: 'mainController',
            templateUrl: 'app/main/main-parent-template.html'
          });

          $stateProvider.state('admin', {
            abstract: true,
            controller: 'mainController',
            templateUrl: 'app/admin/admin-parent-template.html'
          });

          $stateProvider.state(APP_CONSTS.STATE_DEFAULT, {
            url: '/',
            templateUrl: 'app/user/userprofile-template.html'
          })

          .state(APP_CONSTS.STATE_PROFILE, {
              url: '/profile',
              templateUrl: 'app/user/userprofile-template.html'
          })
          .state(APP_CONSTS.STATE_LOGIN, {
              url: '/login',
              templateUrl: 'app/user/login-template.html'
          })
          .state(APP_CONSTS.STATE_ADMIN, {
              controller: 'AdminController',
              url: '/admin',
              templateProvider:  ['$templateFactory', 'sessionService', function ($templateFactory, sessionService) {
                return sessionService.checkLoggedin().then(function() {
                  if (sessionService.isAdmin())
                  {
                    return $templateFactory.fromUrl('app/admin/admin-template.html');
                  }
                  else
                  {
                    return '<div class="position-center"><h3>Unauthorized</h3></div>';
                  }
                },
                function() {
                  return '<div class="position-center"><h3>Unauthorized</h3></div>';
                });
              }]
          })
          .state(APP_CONSTS.STATE_SEARCH, {
              url: '/search',
              templateUrl: 'app/search/searchaddress-template.html'
          })
          .state(APP_CONSTS.STATE_MAP, {
              url: '/map',
              controller: 'ExploreMapController',
              templateUrl: 'app/map/explore-map-template.html',
              resolve: {
                mapView: function() {
                  return {
                    current: APP_CONSTS.MAPVIEW_DEFAULT_PATH
                  };
              }}
          })
          .state(APP_CONSTS.STATE_MAP_CURRENT, {
              url: '/map/' + APP_CONSTS.MAPVIEW_CURRENTUSER_PATH + '/',
              controller: 'ExploreMapController',
              templateUrl: 'app/map/explore-map-template.html',
              resolve: {
                mapView: function() {
                  return {
                    current: APP_CONSTS.MAPVIEW_CURRENTUSER_PATH
                  };
              }}
          })
          .state(APP_CONSTS.STATE_MAP_CURRENT_STREET, {
              url: '/map/' + APP_CONSTS.MAPVIEW_CURRENTUSER_PATH + '/:streetId',
              controller: 'ExploreMapController',
              templateUrl: 'app/map/explore-map-template.html',
              resolve: {
                mapView: function() {
                  return {
                    current: APP_CONSTS.MAPVIEW_CURRENTUSER_PATH
                  };
              }}
        })
        .state(APP_CONSTS.STATE_MAP_LOCATION, {
              url: '/map/' + APP_CONSTS.MAPVIEW_LOCATION_PATH + '/:lat/:lng',
              controller: 'ExploreMapController',
              templateUrl: 'app/map/explore-map-template.html',
              resolve: {
                mapView: function() {
                  return {
                    current: APP_CONSTS.MAPVIEW_LOCATION_PATH
                  };
              }}
            })
        .state(APP_CONSTS.STATE_MAP_LOCATION_STREET, {
              url: '/map/' + APP_CONSTS.MAPVIEW_LOCATION_PATH + '/:lat/:lng/:streetId',
              controller: 'ExploreMapController',
              templateUrl: 'app/map/explore-map-template.html',
              resolve: {
                mapView: function() {
                  return {
                    current: APP_CONSTS.MAPVIEW_LOCATION_PATH
                  };
              }}
            })
        .state(APP_CONSTS.STATE_CALENDAR, {
              url: '/calendar',
              templateUrl: 'app/social/calendar-template.html'
            })
        .state(APP_CONSTS.STATE_SOCIAL, {
              url: '/social',
              templateUrl: 'app/social/social-template.html'
            })
        .state(APP_CONSTS.STATE_MEDIA, {
              url: '/media',
              templateUrl: 'app/info/media-template.html'
            })
        .state(APP_CONSTS.STATE_FAQ, {
              url: '/faq',
              templateUrl: 'app/info/faq-template.html'
            })
        .state(APP_CONSTS.STATE_RESOURCES, {
              url: '/resources',
              templateUrl: 'app/info/resources-template.html'
            })
        .state(APP_CONSTS.STATE_SPONSORS, {
              url: '/sponsors',
              templateUrl: 'app/info/sponsors-template.html'
            })
		.state(APP_CONSTS.STATE_PRIVACY, {
              url: '/privacy',
              templateUrl: 'app/info/privacy-template.html'
            });

        $urlRouterProvider.otherwise('/');

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
