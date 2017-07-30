(function() {
    angular.module('notinphillyServerApp')
        .controller('UserProfileNewController', ['$scope', '$http', '$rootScope', '$location', '$uibModal', 'placeSearchService', 'sessionService', 'mapService', 'APP_EVENTS',
            function($scope, $http, $rootScope, $location, $uibModal, placeSearchService, sessionService, mapService, APP_EVENTS) {
                $scope.userProfile = {
                    isEditing: false,
                    isAdmin: false,
                    neighborsCount: 0 
                };
                $scope.passwordChange = {};
                $scope.user = {
                    adoptedStreets: []
                };
                $scope.userStreetsGeoJSON = [];
                $scope.errorMessage = undefined;

                function SetupCurrentUser() {
                    if ($rootScope.currentUser) {
                        $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
                        $scope.userProfile.isAdmin = $rootScope.currentUser.isAdmin;
                        $http.get("api/users/current/").success(function(data, status) {
                            $scope.user = data;
                            $scope.errorMessage = undefined;

                            if (!$scope.user.fullAddress) $scope.user.fullAddress = $scope.user.address;

                            if ($scope.user.needsCompletion || !$scope.user.hasAgreedToTerms) {
                                //ShowIncompleteForm($scope.user);
                            }

                            $http.get("api/users/neighbors/count").success(function(data, status) {
                                var userCount = data.userCount;

                                $scope.userProfile.neighborsCount = userCount;
                            });

                            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                        },
                        function(err) {
                            $scope.errorMessage = 'Something went wrong. Please try again later.';
                            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                        });
                        
                    } else {
                        $scope.errorMessage = "You are not authorized to view or edit the user profile";
                    }
                }

                function ShowIncompleteForm(user) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/signup/signup-incomplete-template.html',
                        controller: 'SignupIncompleteController',
                        resolve: {
                            user: function () {
                                return user;
                            }
                        }
                    });
                    modalInstance.result.then(function() {

                    });
                }

                $scope.toggleEdit = function() {
                    $scope.userProfile.isEditing = !$scope.userProfile.isEditing;
                    $scope.userProfile.isChangingPassword = false;
                };

                $scope.toggleChangePassword = function() {
                    $scope.passwordChange = {};
                    $scope.userProfile.isChangingPassword = !$scope.userProfile.isChangingPassword;
                    $scope.userProfile.isEditing = false;
                };

                $scope.changePassword = function() {
                    $scope.errorMessage = undefined;

                    if ($scope.passwordChange) {
                        $http.post('/api/users/changePassword/', $scope.passwordChange).
                        success(function(data) {
                            $scope.toggleChangePassword();
                        }).error(function(err) {
                            // Update user error
                            $scope.errorMessage = err;
                        });
                    }
                };

                $scope.update = function() {
                    $scope.errorMessage = undefined;

                    if ($scope.user) {
                        if ($scope.addressDetails) {
                            var address = $scope.addressDetails;

                            $scope.user.zip = address.postalCode;
                            $scope.user.city = address.city;
                            $scope.user.stateName = address.state;
                            $scope.user.streetName = address.streetName;
                            $scope.user.streetNumber = address.streetNumber;
                            $scope.user.addressLocation = address.location;
                            $scope.user.fullAddress = address.fullAddress;
                        }

                        $http.put('/api/users/', $scope.user).
                        success(function(data) {
                            SetupCurrentUser();
                            // Collapse edit form after updating user
                            $scope.userProfile.isEditing = false;
                        }).error(function(err) {
                            // Update user error
                            $scope.errorMessage = err;
                        });
                    }
                };

                $scope.logout = function() {
                    $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
                    sessionService.logout().then(function(response) {
                            $rootScope.$broadcast(APP_EVENTS.LOGOUT);
                            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                        },
                        function(err) {
                            $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                        });
                };

                $scope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
                    SetupCurrentUser();
                });
                
                SetupCurrentUser();
            }
        ]);
})();