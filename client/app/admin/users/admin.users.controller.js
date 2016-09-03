(function () {
angular.module('notinphillyServerApp')
  .controller('AdminUsersController', [ '$scope', '$http', '$uibModal', 'sessionService', function($scope, $http, $uibModal, sessionService) {
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
       { name: 'firstName', enableSorting: false },
       { name: 'lastName', enableSorting: false },
       { name: 'email', enableSorting: false },
       { name: 'businessName', enableSorting: false },
       { name: 'createDate', enableSorting: false },
       { name: 'zip', enableSorting: false },
       { name: 'address', enableSorting: false },
       { name: 'phoneNumber', enableSorting: false },
       { name: 'isDistributer', enableSorting: false },
       { name: 'isAdmin', enableSorting: false },
       { field: '_id', name: '', cellTemplate: 'app/admin/users/user-edit-column.html', width: 34, enableSorting: false},
       { field: '_id', name: '', cellTemplate: 'app/admin/users/user-delete-column.html', width: 34, enableSorting: false}
     ],
     onRegisterApi: function(gridApi) {
       $scope.gridApi = gridApi;
       gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
         paginationOptions.pageNumber = newPage;
         paginationOptions.pageSize = pageSize;
         getPage();
       });
     }
   };

   var getPage = function(pageNumber, pageSize) {
     var url = "/api/users/paged?pageNumber=" + pageNumber + "&pageSize=" + pageSize;

     $http.get(url).success(function (data) {
         $scope.gridOptions.totalItems = data.count;
         $scope.gridOptions.data = data.users;
       });
   };

   $scope.loadUsers = function ()
   {
     getPage(1, 25);
   }

   $scope.addUser = function () {
     var modalInstance = $uibModal.open({
       templateUrl: 'app/admin/users/admin-edituser-template.html',
       controller: 'AdminEditUserController'
     });

     modalInstance.result.then(function (selectedItem) {

                           }, function () {

                           });
   };

  $scope.editUser = function () {
    var modalInstance = $uibModal.open({
      templateUrl: 'app/admin/users/admin-edituser-template.html',
      controller: 'AdminEditUserController'
    });
  };

  $scope.deleteUser = function (grid, row) {
   var modalInstance = $uibModal.open({
     templateUrl: 'app/admin/users/admin-confirm-template.html',
     controller: 'AdminConfirmController'
   });

   modalInstance.result.then(function (selectedItem) {
                           var id = row.entity._id;
                           var url = "/api/users/" + id;

                           $http.delete(url).success(function (data) {
                             $scope.loadUsers();
                           })
                           .error(function (error) {
                               console.error('error:', error);
                           });
                         }, function () {

                         });
  };

   $scope.loadUsers();
  }]);
})();
