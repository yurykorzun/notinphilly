(function () {
angular.module('notinphillyServerApp')
  .controller('mainController', [ '$scope', '$http', '$rootScope', '$cookies', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS',
                              function($scope, $http, $rootScope, $cookies, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.main = {
      isUserProfileVisible: false,
      isUserProfileOpen: false,
      isLoginVisible: false,
      isLoginOpen: false,
      spinnerActive: false
    };

    function ShowUserProfile() {
      $scope.main.isUserProfileVisible = true;
      $scope.main.isUserProfileOpen = true;
      $scope.main.isLoginVisible = false;
      $scope.main.isLoginOpen = false;
    }

    function ShowLoginForm() {
      $scope.main.isUserProfileVisible = false;
      $scope.main.isUserProfileOpen = false;
      $scope.main.isLoginVisible = true;
    }

    $scope.spinnerActive = true;
    $scope.$on(APP_EVENTS.SPINNER_START, function(event) {
      $scope.main.spinnerActive = true;
    });
    $scope.$on(APP_EVENTS.SPINNER_END, function(event) {
      $scope.main.spinnerActive = false;
    });
    $scope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
      ShowUserProfile();
    });
    $scope.$on(APP_EVENTS.LOGIN_FAILED, function(event) {
      ShowLoginForm();
    });
    $scope.$on(APP_EVENTS.LOGOUT, function(event) {
      ShowLoginForm();
    });

    sessionService.checkLoggedin()
                  .then(function() {
                    ShowUserProfile();
                    $scope.main.spinnerActive = false;
                    $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                  },
                  function() {
                    $scope.main.spinnerActive = false;
                    $rootScope.$broadcast(APP_EVENTS.LOGOUT);
                  });
  }]);
})();
