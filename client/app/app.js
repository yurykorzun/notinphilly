(function () {
  var  app = angular.module('notinphillyServerApp', [
      'ngRoute',
      'leaflet-directive',
      'ui.bootstrap',
      'ngAnimate',
      'treasure-overlay-spinner'
    ]);

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
