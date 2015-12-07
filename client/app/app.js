(function () {
  var  app = angular.module('notinphillyServerApp', [
      'ngRoute',
      'leaflet-directive',
      'ui.bootstrap',
      'ngAnimate',
      'treasure-overlay-spinner'
    ])

    app.constant("APP_EVENTS", {
        "SPINNER_START": "spinnerStart",
        "SPINNER_END": "spinnerEnd",
        "LOGIN_SUCCESS": "loginSuccess",
        "LOGOUT": "logout",
        "STREET_ADOPTED": "streetAdopted",
        "STREET_LEFT": "streetLeft"
    });

    app.config(function ($routeProvider, $logProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'app/main/main.html',
          controller: 'mainController'
        })
        .otherwise({
          redirectTo: '/'
        });

        $logProvider.debugEnabled(false);
    });

  app.run([
    '$rootScope',
    function($rootScope) {

    }
  ]);
})();
