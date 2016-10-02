(function () {
angular.module('notinphillyServerApp')
    .controller('AdminInventoryController', [ '$scope', '$http', '$uibModal', 'uiGridConstants', 'sessionService', function($scope, $http, $uibModal, uiGridConstants, sessionService) {
     $scope.gridInventoryOptions = {
       columnDefs: [
        { name: 'name', displayName: 'Tool Name', width:120 },
        { name: 'code', displayName: 'Code', width:90 },
        { name: 'description',  displayName: 'Description'},
        { name: 'totalAvailable', displayName: 'Available', type: 'number', width:90 },
        { name: 'totalPending', displayName: 'Pending', type: 'number', width:90  },
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
             user: function () {
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
             user: function () {
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
         { name: 'status', displayName: 'Status', field: "tool.name", width:100 },
         { name: 'createdAt', displayName: 'Created', field: "createdAt", width:110 },
         { name: 'updatedAt', displayName: 'Created', field: "updatedAt", width:110 },
         { name: 'firstName', displayName: 'First Name', field: "user.firstName", width:130 },
         { name: 'lastName', displayName: 'Last Name', field: "user.lastName", width:130 },
         { name: 'address',  displayName: 'Address', field: "user.address"},
         { name: 'zip', displayName: 'ZipCode', field: "user.zip", width:80 },
         { name: 'email', displayName: 'Email', field: "user.email", width:250 },
         { name: 'phoneNumber', displayName: 'Phone', field: "user.phoneNumber", width:100 }
       ],
       onRegisterApi: function(gridApi) {
         $scope.gridToolRequestApi = gridApi;
         gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
           paginationOptions.pageNumber = newPage;
           paginationOptions.pageSize = pageSize;

          $scope.loadRequests();
         });
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

     $scope.loadRequests = function ()
     {
       getPage(paginationOptions.pageNumber, paginationOptions.pageSize, paginationOptions.sortColumn, paginationOptions.sortDirection);
     };

    $scope.sortChanged = function ( grid, sortColumns ) {

    };

    $scope.loadInventory();
  }]);
})();
