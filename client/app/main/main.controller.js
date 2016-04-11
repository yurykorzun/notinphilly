(function () {
angular.module('notinphillyServerApp')
  .controller('mainController', [ '$scope', '$http', '$rootScope', '$uibModal', '$cookies', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $uibModal, $cookies, mapService, sessionService, APP_EVENTS, APP_CONSTS) {

    $scope.bugTooltip = false;

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

    var foundStreet = $cookies.get(APP_CONSTS.FOUND_STREET);
    
    if (!foundStreet) {
      var modalInstance = $uibModal.open({
                            templateUrl: 'app/main/start-popup-template.html',
                            controller: 'StartPopupController',
                            resolve: {}
                          });
    }


    function ShowUserProfile() {
      $scope.sideMenu.isUserProfileVisible = true;
      $scope.sideMenu.isUserProfileOpen = true;
      $scope.sideMenu.isLoginVisible = false;
      $scope.sideMenu.isLoginOpen = false;
    }

    function ShowLoginForm() {
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
    $scope.$on(APP_EVENTS.ENTER_STREET_LEVEL, function(event) {
      $scope.bugTooltip = true;
    });
    $scope.$on(APP_EVENTS.ENTER_NEIGBORHOOD_LEVEL, function(event) {
      $scope.bugTooltip = false;
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
