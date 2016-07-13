'use strict';

(function () {
  angular.module('notinphillyServerApp').directive('streetslist', function() {
    return {
      restrict: 'E',
      scope: {
        streets: '='
      },
      templateUrl: "app/components/streetslist/streetslist-template.html",
      link: function(scope, element, attrs, controller) {

      }
  });
})();
