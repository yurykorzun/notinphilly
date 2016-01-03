(function () {
  var  app = angular.module('notinphillyServerApp', [
      'ngRoute',
      'leaflet-directive',
      'ui.bootstrap',
      'ngAnimate',
      'treasure-overlay-spinner',
      'ui.select',
      'ngSanitize'
    ])

    app.constant("APP_EVENTS", {
        "SPINNER_START": "spinnerStart",
        "SPINNER_END": "spinnerEnd",
        "LOGIN_SUCCESS": "loginSuccess",
        "LOGOUT": "logout",
        "ENTER_NEIGBORHOOD_LEVEL": "enterNeigborhoodLevel",
        "ENTER_STREET_LEVEL": "enterStreetLevel",
        "STREET_ADOPTED": "streetAdopted",
        "STREET_LEFT": "streetLeft",
        "MAP_CENTER": {  lat: 39.931054,  lng: -75.204009 },
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
