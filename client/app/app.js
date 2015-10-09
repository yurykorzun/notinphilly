var  app = angular.module('notinphillyServerApp', [
    'ngRoute',
    'restangular',
    'leaflet-directive'
  ]);

app.config(function ($routeProvider, RestangularProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

app.run([
  '$rootScope',
  function($rootScope) {
  
  }
]);
