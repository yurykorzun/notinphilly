(function() {
    angular.module('notinphillyServerApp')
        .controller('MessagesListController', ['$scope', '$http', '$rootScope', '$uibModal',
            function($scope, $http, $rootScope, $uibModal) {
                 $scope.createMessage = function() {
                    var modalInstance = $uibModal.open({
                                templateUrl: 'app/messages/messages-createmessage-template.html',
                                resolve: {
                                    message: function () {
                                        return {};
                                    }
                                } 
                            });
                 }

                $scope.viewMessage = function() {
                    var modalInstance = $uibModal.open({
                                templateUrl: 'app/messages/messages-viewmessage-template.html',
                                resolve: {
                                    message: function () {
                                        return {};
                                    }
                                } 
                            });
                 }
            }
        ]);
})();