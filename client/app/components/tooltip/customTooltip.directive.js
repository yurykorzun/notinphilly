angular.module('notinphillyServerApp').directive('customtooltip', function() {
  return {
   restrict: 'A',
   link: function (scope, element, attrs, ngModel) {
     element.on('mousemove', function(event) {
       /*var dx = $event.clientX - initialMouseX;
        var dy = $event.clientY - initialMouseY;
        elm.css({
          top:  startY + dy + 'px',
          left: startX + dx + 'px'
        });
        return false;*/
     });
    }
  }
 });
