(function() {
    angular.module('notinphillyServerApp')
        .controller('mainController', ['$scope', '$rootScope', 'sessionService', 'APP_EVENTS', 'APP_CONSTS', '$window', '$location',
            function($scope, $rootScope, sessionService, APP_EVENTS, APP_CONSTS, $window, $location) {
                $scope.main = {
                    spinnerActive: false
                };

                $scope.spinnerActive = true;
                $scope.$on(APP_EVENTS.SPINNER_START, function(event) {
                    $scope.main.spinnerActive = true;
                });
                $scope.$on(APP_EVENTS.SPINNER_END, function(event) {
                    $scope.main.spinnerActive = false;
                });
          
                $scope.downloadFile = function(filePath) {
                    $window.location.href = filePath;
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

                 // function to set the height on fly
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
            }
        ]);
})();