(function() {
    angular.module('notinphillyServerApp')
        .controller('MessageCreateController', ['$scope', '$http', '$rootScope', '$uibModalInstance',
            function($scope, $http, $rootScope, $uibModalInstance) {
                $scope.recipients = $scope.$resolve.contacts;
                $scope.recipientConfig = {
                        valueField: '_id',
                        labelField: 'fullName',
                        placeholder: 'Select recipients'
                };
                
                $scope.message = {
                    recipientIds: [$scope.$resolve.recipientId],
                    subject: undefined,
                    contents: undefined
                };

                $scope.send = function() {
                    $scope.errorMessage = undefined;

                    if(!$scope.emailForm.$invalid)
                    {
                        $http.post('/api/messages/send/multiple', {
                            recipientUserIds: $scope.message.recipientIds,
                            subject: $scope.message.subject,
                            contents: $scope.message.contents
                        })
                        .success(function(data) {
                            $uibModalInstance.close();
                        }).error(function(err) {
                            $scope.errorMessage = "Oops, something went wrong";
                        });
                    }
                }

                $scope.close = function() {
                    $uibModalInstance.dismiss('cancel');
                }
            }
        ]);
})();