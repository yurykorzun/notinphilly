(function () {
angular.module('notinphillyServerApp')
  .controller('mainController', [ '$scope', '$http', '$rootScope', '$cookies', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS',
                              function($scope, $http, $rootScope, $cookies, mapService, sessionService, APP_EVENTS, APP_CONSTS) {
    $scope.main = {
      isUserProfileVisible: false,
      isLoginVisible: false,
      activeTabIndex: 0,
      spinnerActive: false
    };

    function ShowUserProfile(isActive) {
      $scope.main.isUserProfileVisible = true;
      if(isActive)
      {
        $scope.main.activeTabIndex = 2;
      }
      $scope.main.isLoginVisible = false;
    }

    function ShowLoginForm(isActive) {
      $scope.main.isUserProfileVisible = false;
      $scope.main.isLoginVisible = true;
      if(isActive)
      {
        $scope.main.activeTabIndex = 3;
      }
    }

    $scope.spinnerActive = true;
    $scope.$on(APP_EVENTS.SPINNER_START, function(event) {
      $scope.main.spinnerActive = true;
    });
    $scope.$on(APP_EVENTS.SPINNER_END, function(event) {
      $scope.main.spinnerActive = false;
    });
    $scope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
      ShowUserProfile(true);
    });
    $scope.$on(APP_EVENTS.LOGIN_FAILED, function(event) {
      ShowLoginForm(true);
    });
    $scope.$on(APP_EVENTS.LOGOUT, function(event) {
      ShowLoginForm(true);
    });
    $scope.$on(APP_EVENTS.OPEN_SEARCH, function(event) {
      $scope.main.activeTabIndex = 0;
    });
    $scope.$on(APP_EVENTS.OPEN_EXPLORE, function(event) {
      $scope.main.activeTabIndex = 1;
    });

    $scope.main.onSearchSelect = function() {
      $rootScope.$broadcast(APP_EVENTS.OPENED_SEARCH);
    }

    $scope.main.onExploreSelect = function() {
      $rootScope.$broadcast(APP_EVENTS.OPENED_EXPLORE);
    }

    $scope.main.onExploreLeave = function() {
      $rootScope.$broadcast(APP_EVENTS.CLOSED_EXPLORE);
    }

    sessionService.checkLoggedin()
                  .then(function() {
                    ShowUserProfile();
                    $scope.main.spinnerActive = false;
                    $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                  },
                  function() {
                    $scope.main.spinnerActive = false;
                    $scope.main.isSearchOpen = true;
                    ShowLoginForm(false);
                  });
  }]);
})();
