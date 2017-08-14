(function() {
    angular.module('notinphillyServerApp')
        .controller('headerController', ['$scope', '$http', '$rootScope', '$window', '$location', '$anchorScroll', 'APP_EVENTS', 
            function($scope, $http, $rootScope, $window, $location, $anchorScroll, APP_EVENTS) {
                $scope.header = {
                    isUserProfileEnabled: false,
                    isLoginEnabled: false,
                    activeTabIndex: 0,
                    spinnerActive: false
                };

                $scope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
                    ShowUserProfile(true);
                });
                $scope.$on(APP_EVENTS.LOGIN_FAILED, function(event) {

                });
                $scope.$on(APP_EVENTS.LOGOUT, function(event) {
                    ShowLoginForm(true);
                });
                $scope.$on(APP_EVENTS.OPEN_SEARCH, function(event) {
                    $scope.goToPage("/search");
                });
                $scope.$on(APP_EVENTS.OPEN_EXPLORE, function(event) {
                    $scope.goToPage("/map");
                });

                function ShowUserProfile(isActive) {
                    $scope.header.isUserProfileEnabled = true;
                    $scope.header.isLoginEnabled = false;
                    $scope.goToPage("/profile");                    
                }

                function ShowLoginForm(isActive) {
                    $scope.header.isUserProfileEnabled = false;
                    $scope.header.isLoginEnabled = true;
                    $scope.goToPage("/login");
                }

                $scope.goToPage = function(path) {
                    $location.path(path);

                    $anchorScroll.yOffset = 80;
                    $anchorScroll('bodyContent');
                }

                angular.element($window).bind("scroll", function() {
                    var mainNav = angular.element(document.querySelector('#mainNav'));
                    var offset = $window.pageYOffset;

                    if (offset >= 10) {
                        mainNav.addClass('is-sticky');
                    } else {
                        mainNav.removeClass('is-sticky');
                    }
                });
            }
        ]);
})();