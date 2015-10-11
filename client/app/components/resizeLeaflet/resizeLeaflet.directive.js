angular.module('notinphillyServerApp').directive('resizeleaflet',  ['$window', function ($window) {
  return {
    restrict: 'A',
    scope: {},
    //dynamically resize leaflet map's height
    link: function(scope, element, attributes){
        element.children().height($(window).height());

        angular.element($window).bind('resize', function(){
          angular.element("#cityMap").height($(window).height());
      });
    }
  }
 }]);
