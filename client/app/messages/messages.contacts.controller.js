(function() {
    angular.module('notinphillyServerApp')
        .controller('MessagesContactsController', ['$scope', '$http', '$rootScope', '$uibModal', 'mapService', 'APP_EVENTS',
            function($scope, $http, $rootScope, $uibModal, mapService, APP_EVENTS) {
                $scope.contacts = {
                    connectedUsers: [],
                    pendingConnectedUsers: [],
                    errorMessage: undefined
                }           

                function LoadContacts() {
                    if ($rootScope.currentUser) {
                        $http.get('/api/messages/contacts')
                            .success(function(response) {
                                $scope.contacts.connectedUsers = response.connectedUsers;
                                $scope.contacts.pendingConnectedUsers = response.pendingUsers;
                                $scope.contacts.errorMessage = undefined;
                            }).error(function(err) {
                                $scope.contacts.errorMessage = "Oops, something went wrong";
                            }); 
                    }
                    else
                    {
                        $scope.contacts.errorMessage = "You're not authorized";
                    }
                }

                $scope.requestNeighborsConnections = function() {
                     $http.post('api/messages/connections/request/near')
                            .success(function(response) {
                                LoadContacts();
                                
                                $scope.contacts.errorMessage = undefined;
                            }).error(function(err) {
                                $scope.contacts.errorMessage = "Oops, something went wrong";
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

                $scope.removeContact = function(userContact) {
                    var removeUserId = userContact._id;

                    $http.post('api/messages/connections/cancel', { cancelUserId: removeUserId })
                                .success(function(response) {
                                    LoadContacts();

                                    $scope.contacts.errorMessage = undefined;
                                }).error(function(err) {
                                    $scope.contacts.errorMessage = "Oops, something went wrong";
                                }); 
                }

                $scope.muteContact = function(userContact) {
                    var muteUserId = userContact._id;

                    $http.post('api/messages/connections/mute', { muteUserId: muteUserId })
                        .success(function(response) {
                            LoadContacts();
                            
                            $scope.contacts.errorMessage = undefined;
                        }).error(function(err) {
                            $scope.contacts.errorMessage = "Oops, something went wrong";
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