(function() {
    angular.module('notinphillyServerApp')
        .controller('UserProfileController', 
                    ['$scope', '$http', '$rootScope', '$state', '$uibModal', 'placeSearchService', 'sessionService', 'mapService', 'APP_EVENTS', 'APP_CONSTS',
            function($scope, $http, $rootScope, $state, $uibModal, placeSearchService, sessionService, mapService, APP_EVENTS, APP_CONSTS) {
                $scope.userProfile = {
                    isEditing: false,
                    isAdmin: false
                };
                $scope.passwordChange = {};
                $scope.user = {
                    adoptedStreets: []
                };
                $scope.userStreetsGeoJSON = [];
                $scope.errorMessage = undefined;

                function SetupCurrentUser() {
                    if ($rootScope.currentUser) {
                        $scope.userProfile.isAdmin = $rootScope.currentUser.isAdmin;
                        $http.get("api/users/current/").success(function(data, status) {
                                $scope.user = data;
                                $scope.errorMessage = undefined;

                                if (!$scope.user.fullAddress) $scope.user.fullAddress = $scope.user.address;

                                if ($scope.user.needsCompletion || !$scope.user.hasAgreedToTerms) {
                                    ShowIncompleteForm($scope.user);
                                }

                                UpdateUserStreets();
                            },
                            function(err) {
                                $scope.errorMessage = 'Something went wrong. Please try again later.';
                            });
                    } else {
                        $scope.errorMessage = "You are not authorized to view or edit the user profile";                        
                        $state.go(APP_CONSTS.STATE_LOGIN);
                    }
                }

                function UpdateUserStreets() {
                    mapService.getCurrentUserStreets().then(function(response) {
                        $scope.user.adoptedStreets = response;

                        SetStreetsGeoJSON();
                    });
                }

                function SetStreetsGeoJSON()
                {
                    mapService.getCurrentUserStreetsGeoJSON().then(function(response) {
                        $scope.userStreetsGeoJSON = response;
                    });
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

                $scope.$on(APP_EVENTS.LOGIN_SUCCESS, function(event) {
                    SetupCurrentUser();
                });
                $scope.$on(APP_EVENTS.LOGOUT, function(event) {

                });
                $scope.$on(APP_EVENTS.STREET_ADOPTED, function(event) {
                    UpdateUserStreets();
                });
                $scope.$on(APP_EVENTS.STREET_LEFT, function(event) {
                    UpdateUserStreets();
                });

                $scope.locateStreet = function(streetId) {
                    $state.path(APP_CONSTS.STATE_MAP_CURRENT_STREET, { streetId: streetId });
                };

                $scope.hasStreets = function() {
                    return $scope.user.adoptedStreets.length > 0
                };

                $scope.showBlock = function() {
                    if ($scope.user.addressLocation) {
                        showBlockStreets($scope.user.addressLocation);
                    } else if ($scope.user.fullAddress) {
                        placeSearchService.getLocationByText($scope.user.fullAddress)
                            .then(function(location) {
                                $scope.user.addressLocation = location;
                                $scope.update();

                                showBlockStreets(location);
                            });
                    }
                };

                var showBlockStreets = function(addressLocation) {
                    $state.path(APP_CONSTS.STATE_MAP_LOCATION, { lat: addressLocation.lat, lng: addressLocation.lng });                 
                }

                $scope.switchToMap = function() {
                    $state.path(APP_CONSTS.STATE_MAP_CURRENT);                 
                };

                $scope.navigateToAdmin = function() {
                    if ($rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                        $state.go(APP_CONSTS.STATE_ADMIN);                 
                    }
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
                            $scope.errorMessage = "You are not authorized to view or edit the user profile";   
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
                            $scope.errorMessage = "You are not authorized to view or edit the user profile";   
                        });
                    }
                };

                $scope.logout = function() {
                    sessionService.logout().then(function(response) {
                            $rootScope.$broadcast(APP_EVENTS.LOGOUT);
                            $state.go(APP_CONSTS.STATE_LOGIN);
                        },
                        function(err) {
                            $scope.errorMessage = "You are not authorized to view or edit the user profile";   
                        });
                };

                SetupCurrentUser();
            }
        ]);
})();