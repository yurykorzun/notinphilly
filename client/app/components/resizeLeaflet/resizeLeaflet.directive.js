(function () {
  angular.module('notinphillyServerApp').directive('resizeleaflet',  ['$window', '$timeout', 'leafletData', function ($window, $timeout, leafletData) {
  return {
    restrict: 'A',
    scope: {},
    //dynamically resize leaflet map's height
    link: function(scope, element, attributes){
     scope.$watch(function() {
             return $(".side").height();
            },
            function(newHeight, oldHeight) {
              if($(".side-container").hasClass("ng-hide")) return;

              element.children().height($(".side").height());
              leafletData.getMap().then(function (map) {
                map.invalidateSize();
              });
            });

      angular.element($window).bind('resize', function(){
          angular.element("#cityMap").height($(".side").height());
          leafletData.getMap().then(function (map) {
            map.invalidateSize();
          });
      });
    }
  }
 }]);
})();
