(function() {
    angular.module('notinphillyServerApp')
        .controller('mainController', ['$scope', '$rootScope', '$anchorScroll', '$window', '$location', 'sessionService', 'APP_EVENTS', 'APP_CONSTS',
            function($scope, $rootScope, $anchorScroll, $window, $location, sessionService, APP_EVENTS, APP_CONSTS) {
                $scope.header = {
                    isUserProfileEnabled: false,
                    isLoginEnabled: false,
                    activeTabIndex: 0,
                    spinnerActive: false
                };

                $scope.spinnerActive = true;

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
          
                $scope.downloadFile = function(filePath) {
                    $window.location.href = filePath;
                }

                function ShowUserProfile(isActive) {
                    $scope.header.isUserProfileEnabled = true;
                    $scope.header.isLoginEnabled = false;                    
                }

                function ShowLoginForm(isActive) {
                    $scope.header.isUserProfileEnabled = false;
                    $scope.header.isLoginEnabled = true;
                }

                $scope.toggleSidebar = function(path) {
                    $("#wrapper").toggleClass("toggled");
                }

                $scope.goToPage = function(path) {
                    $location.path(path);
                    $("#wrapper").removeClass("toggled");
                    
                    //$anchorScroll.yOffset = 80;
                    //$anchorScroll('bodyContent');
                }

                sessionService.checkLoggedin()
                    .then(function() {
                            $rootScope.$broadcast(APP_EVENTS.LOGIN_SUCCESS);
                            $scope.main.spinnerActive = false;
                        },
                        function() {
                            $rootScope.$broadcast(APP_EVENTS.LOGOUT);
                            $scope.main.spinnerActive = false;
                        });

                 // pushing footer down
                function autoHeight() {
                    $('#bodyContent').css('min-height', 0);
                    $('#bodyContent').css('min-height', (
                        $(document).height() 
                        - $('#headerContent').height() 
                        - $('#footerContent').height()
                    ));
                }
                
                // onDocumentReady function bind
                $(document).ready(function() {
                    autoHeight();
                });
                
                // onResize bind of the function
                $(window).resize(function() {
                    autoHeight();
                });

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