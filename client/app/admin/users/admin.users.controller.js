(function () {
angular.module('notinphillyServerApp')
  .controller('AdminUsersController', [ '$scope', '$http', '$uibModal', 'uiGridConstants', 'sessionService', function($scope, $http, $uibModal, uiGridConstants, sessionService) {
  $scope.errorMessage = undefined;
  $scope.spinnerActive = false;
  $scope.filterGrabbersConfig = {
    valueField: 'key',
    labelField: 'name',
    placeholder: 'Choose?',
    maxItems: 1
  };
  $scope.filterGrabbersOptions = [
    {
      key: false,
      name: "No"
    },
    {
      key: true,
      name: "Yes"
    }
  ];
  $scope.filterStreetsConfig = {
    valueField: 'key',
    labelField: 'name',
    placeholder: 'Choose?',
    maxItems: 1
  };
  $scope.filterStreetsOptions = [
    {
      key: false,
      name: "No"
    },
    {
      key: true,
      name: "Yes"
    }
  ];
  $scope.filterNeighborhoodsConfig = {
    valueField: '_id',
    labelField: 'name',
    placeholder: 'Choose?',
    sortField: [
      {
          field: 'totalAdoptedStreets',
          direction: 'desc'
      },
      {
        field: 'name',
        direction: 'asc'
    }
    ],
    maxItems: 1,
    render: {
      option:  function(item, escape) {
        return '<div>'
        + '<span>'+item.name+'</span> '
        + '<span> '+item.totalAdoptedStreets+'</span> '
        + '</div>';
      }
    }
  };

  $http.get('/api/neighborhoods').then(function(response) {
    $scope.filterNeighborhoodsOptions = response.data;
  });

  $scope.filters = {
    receivedGrabbers: undefined,
    adoptedStreets: undefined,
    neighborhood: undefined
  };

  var paginationOptions = {
    pageNumber: 1,
    pageSize: 25,
    sortColumn: "firstName",
    sortDirection: "asc"
  };

  var setUsersExportUrl = function(sortColumn, sortDirection)
  {
    $scope.usersExportUrl = "api/users/exportcsv?sortColumn=" + sortColumn + "&sortDirection=" + sortDirection;
  }

  $scope.gridOptions = {
    paginationPageSizes: [25, 50, 75],
    paginationPageSize: 25,
    useExternalPagination: true,
    useExternalSorting: true,
    enableColumnMenus: false,
    enableColumnResizing: true,
    columnDefs: [
      { name: 'firstName', displayName: 'First Name', enableSorting: true, width:130  },
      { name: 'lastName', displayName: 'Last Name', enableSorting: true,  width:130  },
      { name: 'address',  displayName: 'Address', enableSorting: true },
      { name: 'neighborhood.name',  displayName: 'Neighborhood',  width:80 },
      { name: 'zip', displayName: 'ZipCode',  enableSorting: true, width:80 },
      { name: 'email', displayName: 'Email', enableSorting: true, width:250 },
      { name: 'referralSource', displayName: 'Referral', enableSorting: false, width:120 },
      { name: 'phoneNumber', displayName: 'Phone', enableSorting: false, width:100 },
      { name: 'createdAt', displayName: 'Created', enableSorting: true, type: 'date', width:110 },
      { name: 'isDistributer', displayName: 'Distributer?',  enableSorting: false, width:100 },
      { name: 'adoptedStreets.length', displayName: 'Streets', enableSorting: false, width:80 },
      { name: 'isAdmin', displayName: 'Admin?', enableSorting: false, width:80 },
      { name: 'active', displayName: 'Active?', enableSorting: true, width:80 },
      { name: 'editColumn', cellTemplate: 'app/admin/users/user-edit-column.html', width: 34, enableSorting: false},
      { name: 'deleteColumn', cellTemplate: 'app/admin/users/user-delete-column.html', width: 34, enableSorting: false}
    ],
    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
      gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
        paginationOptions.pageNumber = newPage;
        paginationOptions.pageSize = pageSize;

        getPage(paginationOptions.pageNumber, paginationOptions.pageSize, paginationOptions.sortColumn, paginationOptions.sortDirection);
      });
      $scope.gridApi.core.on.sortChanged( $scope, $scope.sortChanged );
    }
  };

  setUsersExportUrl(paginationOptions.sortColumn, paginationOptions.sortDirection);

  $scope.refresh = function ()
  {
    paginationOptions.sortColumn = "firstName";
    paginationOptions.sortDirection = "asc";

    $scope.loadUsers();
  }

  $scope.loadUsers = function ()
  {
    getPage(paginationOptions.pageNumber, paginationOptions.pageSize, paginationOptions.sortColumn, paginationOptions.sortDirection);
  }

  var getPage = function(pageNumber, pageSize, sortColumn, sortDirection) {
    $scope.errorMessage = undefined;
  
    $scope.spinnerActive = true;
    $http.post("/api/users/getPagedFiltered/", {
      paging: {
        pageNumber: pageNumber,
        pageSize: pageSize, 
        sortColumn: sortColumn,
        sortDirection: sortDirection
      },
      filters: $scope.filters
    }).then(function(response) {
      $scope.gridOptions.totalItems = response.data.count;
      $scope.gridOptions.data = response.data.users;
      $scope.spinnerActive = false;
    },
    function(error) {
      $scope.errorMessage = 'Ooops, ' + JSON.stringify(error);
    
      $scope.gridOptions.totalItems = 0;
      $scope.gridOptions.data = [];
      $scope.spinnerActive = false;
    });
  };

    $scope.addUser = function () {
      $scope.errorMessage = undefined;
    
      $http.get('/api/roles/').then(function(response) {
        var modalInstance = $uibModal.open({
          templateUrl: 'app/admin/users/admin-edituser-template.html',
          controller: 'AdminEditUserController',
          resolve: {
              user: function () {
                  return {
                    roles: []
                  };
              },
              roles: function () {
                  return response.data;
              }
            }
        },
        function(error) {
          $scope.errorMessage = 'Ooops, ' + JSON.stringify(error);      
        });

        modalInstance.result.then(function (selectedItem) {

                              }, function () {

                              });
      });
    };

  $scope.editUser = function (grid, row) {
    $scope.errorMessage = undefined;
    
    $http.get('/api/roles/').then(function(response) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/admin/users/admin-edituser-template.html',
        controller: 'AdminEditUserController',
        resolve: {
            user: function () {
                return row.entity;
            },
            roles: function () {
                return response.data;
            }
        }
      },
      function(error) {
        $scope.errorMessage = 'Ooops, ' + JSON.stringify(error);      
      });

      modalInstance.result.then(function () {
                              $scope.loadUsers();
                            },
                            function () {
                              $scope.loadUsers();
                            });
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

  $scope.sortChanged = function ( grid, sortColumns ) {
      if (sortColumns.length === 0)
      {
        $scope.refresh();
      }
      else
      {
        var sortColumn = sortColumns[0];
        paginationOptions.sortColumn = sortColumn.name;
        paginationOptions.sortDirection = sortColumn.sort.direction;

        $scope.loadUsers();

        setUsersExportUrl(paginationOptions.sortColumn, paginationOptions.sortDirection); 
      }
  };

  $scope.loadUsers();
}]);
})();
