(function() {
    angular.module('notinphillyServerApp')
        .controller('ContactPendingViewController', ['$scope', '$http', '$rootScope', '$uibModal', '$uibModalInstance',  'APP_EVENTS',
            function($scope, $http, $rootScope, $uibModal, $uibModalInstance, APP_EVENTS) {
				$scope.contact = $scope.$resolve.contact;

				$scope.close =  function()
                {
                    $uibModalInstance.close();
                }

                $scope.approveContact = function() {
                    $uibModalInstance.close();
                    
                    var pendingUserId = $scope.contact._id;

                    $http.post('api/messages/connections/approve', { pendingUserId: pendingUserId })
                            .success(function(response) {
                                $rootScope.$broadcast(APP_EVENTS.CONTACT_APPROVED);                                
                            }).error(function(err) {

                            }); 
                }

                $scope.rejectContact = function() {
                    $uibModalInstance.close();
                    
                    var cancelUserId = $scope.contact._id;

                    $http.post('api/messages/connections/cancel', { cancelUserId: cancelUserId })
                        .success(function(response) {
                            $rootScope.$broadcast(APP_EVENTS.CONTACT_REJECTED);
                        }).error(function(err) {

                        }); 
                }
			}
		]);
})();