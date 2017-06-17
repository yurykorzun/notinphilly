(function() {
    var app = angular.module('notinphillyServerApp');
    
        app.directive('appFooter', [function() {
            return {
                restrict: 'E',
                templateUrl: 'app/main/footer.html'
            }
        }]);

        app.directive('appHeader', ['$window', function($window) {
            return {
                restrict: 'E',
                controller: function() {
                      // Toggle class for sticky nav on scroll
                    angular.element($window).bind("scroll", function() {
                        var mainNav = angular.element(document.querySelector('#mainNav'));
                        var offset = $window.pageYOffset;

                        if (offset >= 10) {
                            mainNav.addClass('is-sticky');
                        } else {
                            mainNav.removeClass('is-sticky');
                        }
                    });
                },
                templateUrl: 'app/main/header.html'
            }
        }]);

        app.directive('appPartners', [function() {
            return {
                restrict: 'E',
                templateUrl: 'app/main/partners.html'
            }
        }]);

        app.controller('mainController', ['$scope', '$http', '$rootScope', '$cookies', 'mapService', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', '$window', '$location', '$anchorScroll',
            function($scope, $http, $rootScope, $cookies, mapService, sessionService, APP_EVENTS, APP_CONSTS, $window, $location, $anchorScroll) {
                $scope.main = {
                    isUserProfileEnabled: false,
                    isLoginEnabled: false,
                    activeTabIndex: 0,
                    spinnerActive: false
                };

                $scope.tabs = {
                    SEARCH_TAB: 0,
                    MAP_TAB: 1,
                    PROFILE_TAB: 2,
                    LOGIN_TAB: 3,
                    SOCIAL_TAB: 4,  
                    MEDIA_TAB: 5,
                    ABOUT_TAB: 6
                }

                function ShowUserProfile(isActive) {
                    $scope.main.isUserProfileEnabled = true;
                    if (isActive) {
                        $scope.main.openTab($scope.tabs.PROFILE_TAB);
                    }
                    $scope.main.isLoginEnabled = false;
                }

                function ShowLoginForm(isActive) {
                    $scope.main.isUserProfileEnabled = false;
                    $scope.main.isLoginEnabled = true;
                    if (isActive) {
                        $scope.main.openTab($scope.tabs.LOGIN_TAB);
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

                });
                $scope.$on(APP_EVENTS.LOGOUT, function(event) {
                    ShowLoginForm(true);
                });
                $scope.$on(APP_EVENTS.OPEN_SEARCH, function(event) {
                    $scope.main.openTab($scope.tabs.SEARCH_TAB);
                });
                $scope.$on(APP_EVENTS.OPEN_EXPLORE, function(event) {
                    $scope.main.openTab($scope.tabs.MAP_TAB);
                });

                $scope.main.isTabOpen = function(tabIndex) {
                    return $scope.main.activeTabIndex === tabIndex;
                }

                $scope.main.openTab = function(tabIndex, goToTab) {
                    switch (tabIndex) {
                        case 0: // Search
                            $scope.main.activeTabIndex = $scope.tabs.SEARCH_TAB;
                            $rootScope.$broadcast(APP_EVENTS.OPENED_SEARCH);
                            break;
                        case 1: // Explore
                            $scope.main.activeTabIndex = $scope.tabs.MAP_TAB;
                            $rootScope.$broadcast(APP_EVENTS.OPENED_EXPLORE);
                            break;
                        case 2: // Profile
                            $scope.main.activeTabIndex = $scope.tabs.PROFILE_TAB;
                            break;
                        case 3: // Login
                            $scope.main.activeTabIndex = $scope.tabs.LOGIN_TAB;
                            break;
                        case 4: // Social
                            $scope.main.activeTabIndex = $scope.tabs.SOCIAL_TAB;
                            break;    
                        case 5: // Media
                            $scope.main.activeTabIndex = $scope.tabs.MEDIA_TAB;
                            break;
                        case 6: // About
                            $scope.main.activeTabIndex = $scope.tabs.ABOUT_TAB;
                            break;
                        default:
                            $scope.main.activeTabIndex = $scope.tabs.SEARCH_TAB;
                    }

                    // Jump down to the tab area
                    if (goToTab) $scope.main.goToTab();
                }

                $scope.main.goToTab = function() {
                    $anchorScroll.yOffset = 80;
                    $anchorScroll('bodyContent');
                }

                $scope.downloadFile = function(filePath) {
                    $window.location.href = filePath;
                }

                sessionService.checkLoggedin()
                    .then(function() {
                            ShowUserProfile();
                            $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                            $scope.main.spinnerActive = false;
                        },
                        function() {
                            $scope.main.isSearchOpen = true;
                            ShowLoginForm(false);
                            $scope.main.spinnerActive = false;
                        });
            }
        ]);

        
})();