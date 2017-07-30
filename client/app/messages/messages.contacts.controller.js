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

                $scope.sendMessage = function(userContact) {
                    
                }

                $scope.removeContact = function(userContact) {
                    
                }

                $scope.muteContact = function(userContact) {
                    
                }

                $scope.approveContact = function(userContact) {
                    
                }

                $scope.rejectContact = function(userContact) {
                    
                }

                LoadContacts();
            }
        ]);
})();