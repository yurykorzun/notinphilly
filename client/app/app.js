(function () {
  var  app = angular.module('notinphillyServerApp', [
      'ngRoute',
      'ui.bootstrap',
      'ngAnimate',
      'treasure-overlay-spinner',
      'ngCookies',
      'ui.mask',
      'ngSanitize',
      'selectize',
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
        "OPENED_SEARCH": "openedSearch",
        "OPEN_EXPLORE": "openExplore",
        "OPENED_EXPLORE": "openedExplore",
        "ENTER_NEIGBORHOOD_LEVEL": "enterNeigborhoodLevel",
        "ENTER_STREET_LEVEL": "enterStreetLevel",
        "STREET_ADOPTED": "streetAdopted",
        "STREET_LEFT": "streetLeft"
    });

  app.constant("APP_CONSTS", {
    "FOUND_STREET": "notinphilly.foundStreet",
    "ADOPTED_STREET": "notinphilly.adoptedStreet"
  });

    app.config(function ($httpProvider, $routeProvider, $locationProvider, $logProvider, $provide) {
      $httpProvider.defaults.withCredentials = true;
      $routeProvider
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
          templateUrl: 'app/user/userprofile-template.html'
        })
        .when('/profile1', {
          templateUrl: 'app/user/userprofilenew-template.html'
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
  });

  app.run([
    '$rootScope',
    function($rootScope) {

    }
  ]);
})();
