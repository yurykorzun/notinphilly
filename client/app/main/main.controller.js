(function () {
angular.module('notinphillyServerApp')
  .controller('mainController', [ '$scope', '$http', '$rootScope', 'mapService', 'sessionService', 'APP_EVENTS', function($scope, $http, $rootScope, mapService, sessionService, APP_EVENTS) {
    $scope.sideMenu = {
      isUserProfileVisible: false,
      isUserProfileOpen: false,
      isLoginVisible: false,
      isLoginOpen: false,
      spinnerActive: false,
      onMapReturn: function() {
        $rootScope.$broadcast(APP_EVENTS.ENTER_NEIGBORHOOD_LEVEL);
        mapService.setNeighborhoodLayers();
      },
      mapZoomIn: function() {
        mapService.zoomIn(1);
      },
      mapZoomOut: function() {
        mapService.zoomOut(1);
      }
  };

    function ShowUserProfile()
    {
      $scope.sideMenu.isUserProfileVisible = true;
      $scope.sideMenu.isUserProfileOpen = true;
      $scope.sideMenu.isLoginVisible = false;
      $scope.sideMenu.isLoginOpen = false;
    }

    function ShowLoginForm()
    {
      $scope.sideMenu.isUserProfileVisible = false;
      $scope.sideMenu.isUserProfileOpen = false;
      $scope.sideMenu.isLoginVisible = true;
    }

    $scope.sideMenu.spinnerActive = true;
    $scope.$on(APP_EVENTS.SPINNER_START, function(event) {
      $scope.sideMenu.spinnerActive = true;
    });
    $scope.$on(APP_EVENTS.SPINNER_END, function(event) {
      $scope.sideMenu.spinnerActive = false;
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
                    $scope.sideMenu.spinnerActive = false;
                    $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                  },
                  function() {
                    $scope.sideMenu.spinnerActive = false;
                    $rootScope.$broadcast(APP_EVENTS.LOGOUT);
                  });

  }]);
})();
