angular.module('notinphillyServerApp')
  .controller('MainCtrl', function ($scope) {
    angular.extend($scope, {
                center: {
                    lat: 39.952604,
                    lng: -75.163368,
                    zoom: 13
                },
                layers: {
                    baselayers: {
                        xyz: {
                            name: 'OpenStreetMap (XYZ)',
                            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            type: 'xyz'
                        }
                    }
                }
            });
  });
