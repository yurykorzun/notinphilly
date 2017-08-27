(function() {
    angular.module('notinphillyServerApp')
        .controller('MessagesContactsController', ['$scope', '$http', '$rootScope', '$uibModal', 'mapService', 'APP_EVENTS',
            function($scope, $http, $rootScope, $uibModal, mapService, APP_EVENTS) {
                $scope.contacts = {
                    connectedUsers: [],
                    pendingConnectedUsers: [],
                    sentConnectionRequests: false,
                    neighborsCount: 0,
                    errorMessage: undefined
                }           

                function LoadContacts() {
                    $scope.contacts.errorMessage = undefined;
                    
                    if ($rootScope.currentUser) {
                        $http.get('/api/messages/contacts')
                            .success(function(response) {
                                $scope.contacts.connectedUsers = response.connectedUsers;
                                $scope.contacts.pendingConnectedUsers = response.pendingUsers;
                                $scope.contacts.errorMessage = undefined;
                            }).error(function(err) {
                                $scope.contacts.errorMessage = "Oops, something went wrong";
                            }); 

                        $http.get("api/users/current/").success(function(data, status) {
                            $scope.contacts.sentConnectionRequests = data.sentConnectionRequests;
                            if (!data.sentConnectionRequests)
                            {
                                $http.get("api/users/neighbors/count").success(function(data, status) {
                                    var userCount = data.userCount;
            
                                    $scope.contacts.neighborsCount = userCount;
                                });
                            }
                        });
                    }
                    else
                    {
                        $scope.contacts.errorMessage = "You're not authorized";
                    }
                }

                $scope.$on(APP_EVENTS.CONTACT_APPROVED, function(event) {
                    LoadContacts();
                });

                $scope.$on(APP_EVENTS.CONTACT_REJECTED, function(event) {
                    LoadContacts();
                });

                $scope.$on(APP_EVENTS.CONTACT_REMOVED, function(event) {
                    LoadContacts();
                });

                $scope.requestNeighborsConnections = function() {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/dialogs/dialog-confirm.html',
                        controller: 'DialogConfirmController',
                        size: 'sm',
                        resolve: {
                            messageHeader: function () {
                                return "Confirm";
                            },
                            messageBody: function () {
                                return "Do you want to connect with your neighbors? We will send requests to all participants in your block.";
                            },
                            acceptMessage: function () {
                                return "Let's do it!";
                            }
                        }
                      });

                      modalInstance.result.then(function() {
                                                $http.post('api/messages/connections/request/near')
                                                .success(function(response) {
                                                    LoadContacts();
                                                    
                                                    $scope.contacts.errorMessage = undefined;
                                                }).error(function(err) {
                                                    $scope.contacts.errorMessage = "Oops, something went wrong";
                                                }); 
                                            });
                 
                }

                $scope.goToMap = function() {
                    mapService.showUserStreets();
                    $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
                }

                $scope.showCreateMessage = function(userContact) {
                    var modalInstance = $uibModal.open({
                                            templateUrl: 'app/messages/messages-createmessage-template.html',
                                            controller: 'MessageCreateController',
                                            resolve: {
                                                recipientId: function () {
                                                    return userContact._id;
                                                },
                                                contacts:  function () {
                                                    return $scope.contacts.connectedUsers;
                                                },
                                            },
                                            size: "lg"
                                        });
                    modalInstance.result.then(function() {

                    });
                }

                $scope.showContact = function(userContact) {
                    var modalInstance = $uibModal.open({
                                            templateUrl: 'app/messages/messages-contact-view.html',
                                            controller: 'ContactViewController',
                                            resolve: {
                                                contact: function () {
                                                    return userContact;
                                                },
                                                contacts:  function () {
                                                    return $scope.contacts.connectedUsers;
                                                },
                                            }
                                        });
                    modalInstance.result.then(function() {
                        LoadContacts();
                    });
                }

                $scope.showPendingContact = function(userContact) {
                    var modalInstance = $uibModal.open({
                                            templateUrl: 'app/messages/messages-contact-pending-view-template.html',
                                            controller: 'ContactPendingViewController',
                                            resolve: {
                                                contact: function () {
                                                    return userContact;
                                                },
                                            }
                                        });
                    modalInstance.result.then(function() {
                        LoadContacts();
                    });
                }

                $scope.removeContact = function(userContact) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/dialogs/dialog-confirm.html',
                        controller: 'DialogConfirmController',
                        size: 'sm',
                        resolve: {
                            messageHeader: function () {
                                return "Confirm";
                            },
                            messageBody: function () {
                                return "Do you want to remove a contact?";
                            },
                            acceptMessage: function () {
                                return "I am sure";
                            }
                        }
                      });
                   
                      modalInstance.result.then(function () {
                                                var removeUserId = userContact._id;
                            
                                                $http.post('api/messages/connections/cancel', { cancelUserId: removeUserId })
                                                            .success(function(response) {
                                                                LoadContacts();
                            
                                                                $scope.contacts.errorMessage = undefined;
                                                            }).error(function(err) {
                                                                $scope.contacts.errorMessage = "Oops, something went wrong";
                                                            }); 
                                            },
                                            function () {
                                            });
                }

                $scope.muteContact = function(userContact) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/dialogs/dialog-confirm.html',
                        controller: 'DialogConfirmController',
                        size: 'sm',
                        resolve: {
                            messageHeader: function () {
                                return "Confirm";
                            },
                            messageBody: function () {
                                return "Do you want to mute a contact and prevent this user from contacting you?";
                            },
                            acceptMessage: function () {
                                return "I am sure";
                            }
                        }
                      });

                    modalInstance.result.then(function () {
                        var muteUserId = userContact._id;
                        
                                            $http.post('api/messages/connections/mute', { muteUserId: muteUserId })
                                                .success(function(response) {
                                                    LoadContacts();
                                                    
                                                    $scope.contacts.errorMessage = undefined;
                                                }).error(function(err) {
                                                    $scope.contacts.errorMessage = "Oops, something went wrong";
                                                }); 
                    },
                    function () {
                    });
                   
                 
                }

                $scope.approveContact = function(userContact) {
                    var pendingUserId = userContact._id;

                    $http.post('api/messages/connections/approve', { pendingUserId: pendingUserId })
                            .success(function(response) {
                                LoadContacts();
                                
                                $scope.contacts.errorMessage = undefined;
                            }).error(function(err) {
                                $scope.contacts.errorMessage = "Oops, something went wrong";
                            }); 
                }

                $scope.rejectContact = function(userContact) {
                    var cancelUserId = userContact._id;

                    $http.post('api/messages/connections/cancel', { cancelUserId: cancelUserId })
                        .success(function(response) {
                            LoadContacts();
                            
                            $scope.contacts.errorMessage = undefined;
                        }).error(function(err) {
                            $scope.contacts.errorMessage = "Oops, something went wrong";
                        }); 
                }

                LoadContacts();
            }
        ]);
})();