(function () {
angular.module('notinphillyServerApp')
  .controller('mainController', [ '$scope', '$http', '$rootScope', '$cookies', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', '$window', '$location', '$anchorScroll',
                              function($scope, $http, $rootScope, $cookies, mapService, sessionService, APP_EVENTS, APP_CONSTS, $window, $location, $anchorScroll) {
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

    $scope.main.topNav = function(tabIndex) {

      switch (tabIndex){
          case 0: // Search
            $scope.main.activeTabIndex = 0;
            $scope.main.onSearchSelect();
          break;
          case 1: // Explore
            $scope.main.activeTabIndex = 1;
            $scope.main.onExploreSelect();
          break;
          case 2: // Login
            ShowLoginForm(true);
          break;
          case 3: // Account
            ShowUserProfile(true);
          break;
          case 4: // About
            $scope.main.activeTabIndex = 4;
          break;
          default: $scope.main.activeTabIndex = 0;
      }

      // Jump down to the tab area
      $scope.main.goToTab();
    }

    $scope.main.goToTab = function() {
      $anchorScroll.yOffset = 80;
      $anchorScroll('bodyContent');
    }

    // Toggle class for sticky nav on scroll
    angular.element($window).bind("scroll", function() {
      var mainNav = angular.element( document.querySelector( '#mainNav' ) );
      var offset = $window.pageYOffset;
        
      if (offset >= 10) {
        mainNav.addClass('is-sticky');
      } else {
        mainNav.removeClass('is-sticky');
      }
    });

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
