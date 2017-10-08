(function () {
	angular.module('notinphillyServerApp')
	  .controller('ExploreMapController', [ '$scope', '$routeParams', '$rootScope', 'mapView', 'mapService', 'APP_EVENTS', 'APP_CONSTS', 
	  function($scope, $routeParams, $rootScope, mapView, mapService, APP_EVENTS, APP_CONSTS) 
	  {
			switch(mapView.current)
			{
				case APP_CONSTS.MAPVIEW_DEFAULT_PATH:
					mapService.showNeighborhoodLayers();
				break;
				case APP_CONSTS.MAPVIEW_LOCATION_PATH:
					var streetId = $routeParams.streetId;
					mapService.showStreetsNear({ lng: parseFloat($routeParams.lng), lat: parseFloat($routeParams.lat) })
								.then(function(result) {
								if (streetId) mapService.selectStreet($routeParams.streetId);
								});  
				break;
				case APP_CONSTS.MAPVIEW_CURRENTUSER_PATH:
					var streetId = $routeParams.streetId;      
					mapService.showUserStreets()
								.then(function(result) {
								if (streetId) mapService.selectStreet($routeParams.streetId);
								}); 
				break;
				case APP_CONSTS.MAPVIEW_STREETS_PATH:
				break;
				default: 
					mapService.showNeighborhoodLayers();
				break;
			}
		
			mapService.setCalendarEvents();
	  }]);
	})();
	