angular.module('notinphillyServerApp')
  .service('mapService', function() {

    var getRandomColor = function ()
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
    };

    var highlightNeighborhood = function(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 7,
            fillOpacity: 0.9,
            color: '#666'
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    };

    var resetHighlightNeighborhood = function(e) {
        var layer = e.target;

        layer.setStyle({
          color: 'Blue',
          fillOpacity: 0.2,
          weight: 2
        });
    };

   var highlightStreet = function(e) {
        var layer = e.target;

        layer.setStyle({
            opacity: 0.8,
            weight: 15
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    };

    var resetHighlightStreet = function(e) {
        var layer = e.target;

        layer.setStyle({
          opacity: 0.5,
          weight: 5
        });
    };

    var onLayerClick = function(e)
		{
			if(e.target.feature)
			{

      }
		}

    this.setNeigborhoodLayerSettings = function (feature, layer){
           layer.setStyle(getRandomColor());
           layer.on({
            mouseover: highlightNeighborhood,
            mouseout: resetHighlightNeighborhood,
            click: onLayerClick
           });
     }
});
