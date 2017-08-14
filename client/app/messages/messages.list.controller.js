(function() {
    angular.module('notinphillyServerApp')
        .controller('MessagesListController', ['$scope', '$http', '$rootScope', '$uibModal',
            function($scope, $http, $rootScope, $uibModal) {
                $scope.errorMessage = undefined;
                $scope.activeTabIndex = 0;

                $scope.receivedMessages = {
                    unread: 0,                    
                    pagedMessages: [],
                    page: 1,
                    pages: 1,                    
                    pageSize: 6,
                    pageStart: 0,
                    pageEnd: 0,
                    total: 0,                    
                    hasMore: false
                }

                $scope.sentMessages = {
                    pagedMessages: [],
                    page: 1,
                    pages: 1,                                        
                    pageSize: 6,
                    pageStart: 0,
                    pageEnd: 0,
                    total: 0,                    
                    hasMore: false
                }

                $scope.tabs = {
                    INBOX: 0,
                    SENT: 1
                }

                function getMessages()
                {
                    $scope.errorMessage = undefined;

                    if ($rootScope.currentUser) {
                        $http.get('/api/messages/received/paged/' + $scope.receivedMessages.page + '/' + $scope.receivedMessages.pageSize)
                            .success(function(response) {
                                $scope.receivedMessages.pagedMessages = response.messages;
                                $scope.receivedMessages.total = response.totalCount;
                                $scope.receivedMessages.hasMore = response.hasMore;
                                $scope.receivedMessages.hasPager = $scope.receivedMessages.total > $scope.receivedMessages.pageSize;
                                if ($scope.receivedMessages.hasPager)
                                {                               
                                    $scope.receivedMessages.pages = Math.ceil($scope.receivedMessages.total/$scope.receivedMessages.pageSize);
                                    var pageStartIndex = ($scope.receivedMessages.pageSize * ($scope.receivedMessages.page-1));
                                    $scope.receivedMessages.pageStart = pageStartIndex + 1;
                                    $scope.receivedMessages.pageEnd = pageStartIndex + $scope.receivedMessages.pagedMessages.length;
                                }
                            }).error(function(err) {
                                $scope.errorMessage = "Oops, something went wrong";
                            }); 

                        $http.get('/api/messages/received/unread/count')
                            .success(function(response) {
                                $scope.receivedMessages.unread = response.unreadCount;                       
                            }).error(function(err) {
                                $scope.errorMessage = "Oops, something went wrong";
                            });

                        $http.get('/api/messages/sent/paged/' + $scope.sentMessages.page + '/' + $scope.sentMessages.pageSize)
                            .success(function(response) {
                                $scope.sentMessages.pagedMessages = response.messages;
                                $scope.sentMessages.total = response.totalCount;
                                $scope.sentMessages.hasMore = response.hasMore;
                                if ($scope.sentMessages.total > $scope.sentMessages.pageSize)
                                {
                                    $scope.sentMessages.pages = Math.ceil($scope.sentMessages.total/$scope.sentMessages.pageSize);
                                    var pageStartIndex = ($scope.sentMessages.pageSize * ($scope.sentMessages.page-1));
                                    $scope.sentMessages.pageStart = pageStartIndex + 1;
                                    $scope.sentMessages.pageEnd = pageStartIndex + $scope.sentMessages.pagedMessages.length;
                                }
                            }).error(function(err) {
                                $scope.errorMessage = "Oops, something went wrong";
                            }); 
                    }
                    else
                    {
                        $scope.errorMessage = "You're not authorized";
                    }
                }

                $scope.isTabOpen = function(tabIndex) {
                    return $scope.activeTabIndex === tabIndex;
                }

                $scope.openTab = function(tabIndex) {
                    switch (tabIndex) {
                        case 0: // Inbox
                            $scope.activeTabIndex = $scope.tabs.INBOX;
                            break;
                        case 1: // Sent
                            $scope.activeTabIndex = $scope.tabs.SENT;
                            break;
                        default:
                            $scope.activeTabIndex = $scope.tabs.INBOX;
                    }
                }

                $scope.receivedMessages.goBack = function() {
                    if ($scope.receivedMessages.page > 1)
                    {
                        $scope.receivedMessages.page--;
                        getMessages();                        
                    }
                }

                $scope.receivedMessages.goForward = function() {
                    if ($scope.receivedMessages.hasMore)
                    {
                        $scope.receivedMessages.page++;
                        getMessages();
                    }
                }

                $scope.sentMessages.goBack = function() {
                    if ($scope.sentMessages.page > 1)
                    {
                        $scope.sentMessages.page--;
                        getMessages();                        
                    }
                }

                $scope.sentMessages.goForward = function() {
                    if ($scope.sentMessages.hasMore)
                    {
                        $scope.sentMessages.page++;
                        getMessages();
                    }
                }


                $scope.createMessage = function() {
                    var modalInstance = $uibModal.open({
                                            templateUrl: 'app/messages/messages-createmessage-template.html',
                                            controller: 'MessageCreateController',
                                            resolve: {
                                                recipient: function () {
                                                    return {};
                                                }
                                            },
                                            size: "lg"
                                        });
                    modalInstance.result.then(function() {
                        getMessages();
                    });
                }

                $scope.viewMessage = function(message) {
                    var modalInstance = $uibModal.open({
                                templateUrl: 'app/messages/messages-viewmessage-template.html',
                                controller: 'MessageViewController',
                                resolve: {
                                    message: function () {
                                        return message;
                                    }
                                },
                                size: "lg"
                            });
                    modalInstance.result.then(function() {
                        getMessages();
                    });
                 }

                 $scope.deleteMessage = function(message) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/messages/dialogs/messages-confirm.html',
                        controller: 'MessageConfirmController',
                        size: 'sm'
                      });
                   
                      modalInstance.result.then(function () {
                                                $http.delete('/api/messages/' + message._id)
                                                .success(function(response) {
                                                    getMessages();   
                                                }).error(function(err) {
                                                    $scope.errorMessage = "Oops, something went wrong";
                                                });
                                            },
                                            function () {
                                            });
                 }


                 getMessages();
            }
        ]);
})();