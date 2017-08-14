(function() {
    angular.module('notinphillyServerApp')
        .controller('UserProfileController', ['$scope', '$http', '$rootScope', '$location', '$uibModal', 'placeSearchService', 'sessionService', 'mapService', 'APP_EVENTS',
            function($scope, $http, $rootScope, $location, $uibModal, placeSearchService, sessionService, mapService, APP_EVENTS) {
                $scope.userProfile = {
                    isEditing: false,
                    isAdmin: false,
                    enableToolRequest: false,
                    toolRequestAvailable: false,
                    toolRequestIsPending: false,
                    toolRequestWasApproved: false,
                    toolRequestWasDelivered: false
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
                        $scope.userProfile.enableToolRequest = $scope.userProfile.isAdmin;
                        $http.get("api/users/current/").success(function(data, status) {
                                $scope.user = data;
                                $scope.errorMessage = undefined;

                                if (!$scope.user.fullAddress) $scope.user.fullAddress = $scope.user.address;
                                SetupToolRequest();

                                if ($scope.user.needsCompletion || !$scope.user.hasAgreedToTerms) {
                                    ShowIncompleteForm($scope.user);
                                }

                                UpdateUserStreets();
                                $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                            },
                            function(err) {
                                $scope.errorMessage = 'Something went wrong. Please try again later.';
                                $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
                            });
                    } else {
                        $scope.errorMessage = "You are not authorized to view or edit the user profile";                        
                        $location.path("/login");
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

                function SetupToolRequest() {
                    $scope.userProfile.toolRequestAvailable = false;

                    $http.get("api/toolrequests/current/count").success(function(countResponse) {
                        if (countResponse.count > 0) {
                            $http.get("api/toolrequests/current").success(function(request) {
                                if (request.pending.length > 0) $scope.userProfile.toolRequestIsPending = true;
                                else if (request.approved.length > 0) $scope.userProfile.toolRequestWasApproved = true;
                                else if (request.delivered.length > 0) $scope.userProfile.toolRequestWasDelivered = true;
                                else $scope.userProfile.toolRequestAvailable = true;
                            });
                        } else {
                            $scope.userProfile.toolRequestAvailable = false;
                            $scope.userProfile.toolRequestIsPending = $scope.userProfile.toolRequestWasApproved = $scope.userProfile.toolRequestWasDelivered = false;
                        }
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

                $scope.makeToolRequest = function() {
                    if (!$scope.userProfile.hasRequests && $rootScope.currentUser) {
                        var userId = $rootScope.currentUser._id;
                        $http.post("api/toolrequests", { code: "grabber" }).success(function(response) {
                                SetupToolRequest();
                            },
                            function(err) {
                                $scope.errorMessage = "Something went wrong, please try later";
                            });
                    }
                }

                $scope.locateStreet = function(streetId) {
                    mapService.showUserStreets();
                    mapService.selectStreet(streetId);

                    $rootScope.$broadcast(APP_EVENTS.ENTER_STREET_LEVEL);
                    $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
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
                    mapService.showStreetsNear(addressLocation);
                    $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
                }

                $scope.switchToMap = function() {
                    mapService.showUserStreets();
                    $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
                };

                $scope.navigateToAdmin = function() {
                    if ($rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                        $location.path("/admin");
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

                SetupCurrentUser();
            }
        ]);
})();