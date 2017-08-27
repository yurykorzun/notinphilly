(function() {
    angular.module('notinphillyServerApp')
        .controller('ContactViewController', ['$scope', '$http', '$rootScope', '$uibModal', '$uibModalInstance', 'APP_EVENTS',
            function($scope, $http, $rootScope, $uibModal, $uibModalInstance, APP_EVENTS) {
                $scope.contact = $scope.$resolve.contact;
				$scope.connectedUsers = $scope.$resolve.contacts;                

				$scope.close =  function()
                {
                    $uibModalInstance.close();
                }

                $scope.showCreateMessage = function() {
                    $uibModalInstance.close();
                    
                    var modalInstance = $uibModal.open({
                                            templateUrl: 'app/messages/messages-createmessage-template.html',
                                            controller: 'MessageCreateController',
                                            resolve: {
                                                recipientId: function () {
                                                    return $scope.contact._id;
                                                },
                                                contacts:  function () {
                                                    return $scope.connectedUsers;
                                                },
                                            },
                                            size: "lg"
                                        });
                    modalInstance.result.then(function() {
                    });
                }

                $scope.removeContact = function() {
                    $uibModalInstance.close();
                    
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
                                                var removeUserId = $scope.contact._id;
                            
                                                $http.post('api/messages/connections/cancel', { cancelUserId: removeUserId })
                                                            .success(function(response) {
                                                                $rootScope.$broadcast(APP_EVENTS.CONTACT_REMOVED);                                                                
                                                            }).error(function(err) {
                                                            }); 
                                            },
                                            function () {
                                            });
                }

                $scope.muteContact = function() {
                    $uibModalInstance.close();
                    
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
                        var muteUserId = $scope.contact._id;
                        
                        $http.post('api/messages/connections/mute', { muteUserId: muteUserId })
                            .success(function(response) {

                            }).error(function(err) {
                               
                            }); 
                    },
                    function () {

                    });
                }
    }
		]);
})();