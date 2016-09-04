(function () {
angular.module('notinphillyServerApp')
  .controller('AdminUsersController', [ '$scope', '$http', '$uibModal', 'uiGridConstants', 'sessionService', function($scope, $http, $uibModal, uiGridConstants, sessionService) {
    $scope.spinnerActive = false;

    var paginationOptions = {
     pageNumber: 1,
     pageSize: 25,
     sort: null
   };

   $scope.gridOptions = {
     paginationPageSizes: [25, 50, 75],
     paginationPageSize: 25,
     useExternalPagination: true,
     useExternalSorting: true,
     columnDefs: [
       { name: 'firstName', displayName: 'First Name', enableSorting: false, width:130  },
       { name: 'lastName', displayName: 'Last Name', enableSorting: false,  width:130  },
       { name: 'address',  displayName: 'Address', enableSorting: false },
       { name: 'zip', displayName: 'ZipCode',  enableSorting: false, width:80 },
       { name: 'email', displayName: 'Email', enableSorting: false, width:250 },
       { name: 'businessName', displayName: 'Organization', enableSorting: false, width:120 },
       { name: 'phoneNumber', displayName: 'Phone', enableSorting: false, width:100 },
       { name: 'createdAt', displayName: 'Created', enableSorting: false, type: 'date', width:110 },
       { name: 'isDistributer', displayName: 'Distributer?',  enableSorting: false, width:100 },
       { name: 'isAdmin', displayName: 'Admin?', enableSorting: false, width:80 },
       { name: 'active', displayName: 'Active?', enableSorting: false, width:80 },
       { name: 'editColumn', cellTemplate: 'app/admin/users/user-edit-column.html', width: 34, enableSorting: false},
       { name: 'deleteColumn', cellTemplate: 'app/admin/users/user-delete-column.html', width: 34, enableSorting: false}
     ],
     onRegisterApi: function(gridApi) {
       $scope.gridApi = gridApi;
       gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
         paginationOptions.pageNumber = newPage;
         paginationOptions.pageSize = pageSize;

         getPage(newPage, pageSize);
       });
     }
   };

   $scope.loadUsers = function ()
   {
     getPage(paginationOptions.pageNumber, paginationOptions.pageSize);
   }

   var getPage = function(pageNumber, pageSize) {
     $scope.spinnerActive = true;
     var url = "/api/users/paged/" + pageNumber + "/" + pageSize;

     $http.get(url).success(function (data) {
         $scope.gridOptions.totalItems = data.count;
         $scope.gridOptions.data = data.users;
         $scope.spinnerActive = false;
       });
   };

   $scope.addUser = function (grid, row) {
     var modalInstance = $uibModal.open({
       templateUrl: 'app/admin/users/admin-edituser-template.html',
       controller: 'AdminEditUserController'
     });

     modalInstance.result.then(function (selectedItem) {

                           }, function () {

                           });
   };

  $scope.editUser = function (grid, row) {
    var modalInstance = $uibModal.open({
      templateUrl: 'app/admin/users/admin-edituser-template.html',
      controller: 'AdminEditUserController',
      resolve: {
          user: function () {
              return row.entity;
          }
      }
    });

    modalInstance.result.then(function () {
                            $scope.loadUsers();
                          },
                          function () {
                            $scope.loadUsers();
                          });
  };

  $scope.deleteUser = function (grid, row) {
   var modalInstance = $uibModal.open({
     templateUrl: 'app/admin/users/admin-confirm-template.html',
     controller: 'AdminConfirmController',
     size: 'sm'
   });

   modalInstance.result.then(function () {
                           var id = row.entity._id;
                           var url = "/api/users/" + id;

                           $http.delete(url).success(function (data) {
                             $scope.loadUsers();
                           })
                           .error(function (error) {
                               console.error('user deletion error:', error);
                           });
                         },
                         function () {
                         });
  };

   $scope.loadUsers();
  }]);
})();
