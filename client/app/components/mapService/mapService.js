angular.module('notinphillyServerApp')
  .factory('mapService', ['$window', function(win) {
   function setNeigborhoodLayerSettings(feature, layer){
        layer.setStyle($scope.getRandomColor());
        layer.on({
         mouseover: highlightNeighborhood,
         mouseout: resetHighlightNeighborhood,
         click: onLayerClick
        });
    }

    function getRandomColor()
    {
       var colorValue = Math.floor(Math.random() * 3) + 1;
       var style= {};

       switch (colorValue) {
         case 1:
           style = {
             color: 'Blue',
             weight: 2,
             fillColor: 'Red',
             fillOpacity: 0.2
           };
           break;
         case 2:
           style = {
             color: 'Blue',
             weight: 2,
             fillColor: 'Green',
             fillOpacity: 0.2
           };
           break;
         case 3:
           style = {
               color: 'Blue',
               weight: 2,
               fillColor: 'Yellow',
               fillOpacity: 0.2
             };
           break;
       }

       return style;
    }

     };
   }]);
