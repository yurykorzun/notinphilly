(function () {
angular.module('notinphillyServerApp')
    .controller('AdminInventoryController', [ '$scope', '$http', '$uibModal', 'uiGridConstants', 'sessionService', function($scope, $http, $uibModal, uiGridConstants, sessionService) {
     $scope.gridInventoryOptions = {
       columnDefs: [
        { name: 'name', displayName: 'Tool Name', width:120 },
        { name: 'code', displayName: 'Code', width:90 },
        { name: 'description',  displayName: 'Description'},
        { name: 'totalAvailable', displayName: 'Available', cellClass: 'grid-highlighted-cell', type: 'number', width:90 },
        { name: 'totalPending', displayName: 'Pending', type: 'number', width:90  },
        { name: 'totalApproved', displayName: 'Approved', type: 'number', width:90  },
        { name: 'totalDelivered', displayName: 'Delivered', type: 'number', width:90  },
        { name: 'editColumn', cellTemplate: 'app/admin/inventory/inventory-edit-column.html', width: 34}
       ],
       onRegisterApi: function(gridApi) {
         $scope.gridInventoryApi = gridApi;
       }
     };

     $scope.loadInventory = function ()
     {
       $http.get('/api/inventory/')
            .success(function(data) {
              $scope.gridInventoryOptions.data = data;
            });
     };

     $scope.addTool = function ()
     {
       var modalInstance = $uibModal.open({
         templateUrl: 'app/admin/inventory/admin-editinventory-template.html',
         controller: 'AdminEditInventoryController',
         resolve: {
             tool: function () {
                 return {};
             }
           }
       });

       modalInstance.result.then(function (selectedItem) {
                              $scope.loadInventory();
                             }, function () {
                               $scope.loadInventory();
                             });
     };

     $scope.editTool = function (grid, row) {
       var modalInstance = $uibModal.open({
         templateUrl: 'app/admin/inventory/admin-editinventory-template.html',
         controller: 'AdminEditInventoryController',
         resolve: {
             tool: function () {
                 return row.entity;
             }
           }
       });

       modalInstance.result.then(function (selectedItem) {
                              $scope.loadInventory();
                             }, function () {
                              $scope.loadInventory();
                             });
     };

     var paginationOptions = {
        pageNumber: 1,
        pageSize: 25,
        sortColumn: "updatedAt",
        sortDirection: "desc"
      };

     $scope.gridToolRequestOptions = {
       paginationPageSizes: [25, 50, 75],
       paginationPageSize: 25,
       useExternalPagination: true,
       useExternalSorting: true,
       enableColumnMenus: false,
       enableColumnResizing: true,
       columnDefs: [
         { name: 'tool', displayName: 'Tool', field: "tool.name", width:100 },
         { name: 'status', displayName: 'Status', cellClass: 'grid-highlighted-cell', field: "status.name", width:100 },
         { name: 'updatedAt', displayName: 'Updated', field: "updatedAt", width:110 },
         { name: 'firstName', displayName: 'First Name', field: "user.firstName", width:130 },
         { name: 'lastName', displayName: 'Last Name', field: "user.lastName", width:130 },
         { name: 'address',  displayName: 'Address', field: "user.address"},
         { name: 'zip', displayName: 'ZipCode', field: "user.zip", width:80 },
         { name: 'email', displayName: 'Email', field: "user.email", width:250 },
         { name: 'phoneNumber', displayName: 'Phone', field: "user.phoneNumber", width:100 },
         { name: 'editColumn', cellTemplate: 'app/admin/inventory/request-edit-column.html', width: 34},
         { name: 'deleteColumn', cellTemplate: 'app/admin/inventory/request-delete-column.html', width: 34}
       ],
       onRegisterApi: function(gridApi) {
         $scope.gridToolRequestApi = gridApi;
         gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
           paginationOptions.pageNumber = newPage;
           paginationOptions.pageSize = pageSize;
         });
         $scope.loadRequests();
         $scope.gridToolRequestApi.core.on.sortChanged( $scope, $scope.sortChanged );
       }
     };

     var getPage = function(pageNumber, pageSize, sortColumn, sortDirection) {
       var url = "/api/toolrequests/paged/" + pageNumber + "/" + pageSize + "/" + sortColumn + "/" + sortDirection;

       $http.get(url).success(function (data) {
           $scope.gridToolRequestOptions.totalItems = data.count;
           $scope.gridToolRequestOptions.data = data.requests;
         });
     };

     $scope.editRequest = function (grid, row) {
       $http.get('/api/toolrequests/statuses').success(function(response) {
         var modalInstance = $uibModal.open({
           templateUrl: 'app/admin/inventory/admin-editrequest-template.html',
           controller: 'AdminEditRequestController',
           resolve: {
               request: function () {
                 return row.entity;
               },
               statuses: function () {
                 return response;
               }
             }
         });

         modalInstance.result.then(function (selectedItem) {
            $scope.loadRequests();
            $scope.loadInventory();
           }
         );
       });
     };

     $scope.deleteRequest = function (grid, row) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/admin/users/admin-confirm-template.html',
        controller: 'AdminConfirmController',
        size: 'sm'
      });

      modalInstance.result.then(function () {
                              var id = row.entity._id;
                              var url = "/api/toolrequests/" + id;

                              $http.delete(url).success(function (data) {
                                $scope.loadRequests();
                                $scope.loadInventory();
                              })
                              .error(function (error) {
                                  console.error('user deletion error:', error);
                              });
                            },
                            function () {
                            });
     };

     $scope.loadRequests = function ()
     {
       getPage(paginationOptions.pageNumber, paginationOptions.pageSize, paginationOptions.sortColumn, paginationOptions.sortDirection);
     };

    $scope.sortChanged = function ( grid, sortColumns ) {

    };

    $scope.loadInventory();
  }]);
})();
