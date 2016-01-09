(function () {
  angular.module('notinphillyServerApp').directive('resizeleaflet',  ['$window', 'leafletData', function ($window, leafletData) {
  return {
    restrict: 'A',
    scope: {},
    //dynamically resize leaflet map's height
    link: function(scope, element, attributes){

      var resizeMap = function() {
        var mapDiv = element.children();
        var isSideMenuVisibile = !$(".side-container").hasClass("ng-hide");
        var sideMenuHeight = $(".side").height();
        var windowHeight = $($window).height();
        var currentHeight = mapDiv.height();

        var newHeight = isSideMenuVisibile && sideMenuHeight > windowHeight ? sideMenuHeight : windowHeight;

        if(newHeight != currentHeight)
        {
          leafletData.getMap().then(function (map) {
            mapDiv.height(newHeight);
            map.invalidateSize();
          });
        }
      };

      angular.element($window).bind("scroll", resizeMap);

      scope.$watch(function() { return $(".side").height(); }, resizeMap);

      angular.element($window).bind('resize', resizeMap);
    }
  }
 }]);
})();
