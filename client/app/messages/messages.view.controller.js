(function() {
    angular.module('notinphillyServerApp')
        .controller('MessageViewController', ['$scope', '$http', '$rootScope', '$uibModal', '$uibModalInstance',
            function($scope, $http, $rootScope, $uibModal, $uibModalInstance) {
                $scope.message = $scope.$resolve.message;

                $http.post('/api/messages/markasread', {
                    messageIds: [$scope.message._id]
                })
                .success(function(response) {
                }); 

                $scope.respond = function()
                {
                    $scope.errorMessage = undefined;
                    var recipientId = $scope.message.from._id;

                    $http.get('/api/messages/contacts')
                            .success(function(response) {
                                $uibModalInstance.close();
                                var modalInstance = $uibModal.open({
                                    templateUrl: 'app/messages/messages-createmessage-template.html',
                                    controller: 'MessageCreateController',
                                    resolve: {
                                        recipientId: function () {
                                            return recipientId;
                                        },
                                        contacts:  function () {
                                            return response.connectedUsers;
                                        }
                                    },
                                    size: "lg"
                                });
                            }).error(function(err) {
                                $scope.errorMessage = "Oops, something went wrong";
                            }); 
                    
                }

                $scope.close = function()
                {
                    $uibModalInstance.close();
                }

                $scope.delete = function()
                {
                    $scope.errorMessage = undefined;

                    $http.delete('/api/messages/' + $scope.message._id)
                            .success(function(data) {
                                $uibModalInstance.close();
                            }).error(function(err) {
                                $scope.errorMessage = "Oops, something went wrong";
                            });
                }
            }
        ]);
})();