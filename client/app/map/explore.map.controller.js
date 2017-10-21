(function () {
	angular.module('notinphillyServerApp')
	  .controller('ExploreMapController', [ '$scope', '$stateParams', '$rootScope', 'mapView', 'mapService', 'APP_EVENTS', 'APP_CONSTS', 
	  function($scope, $stateParams, $rootScope, mapView, mapService, APP_EVENTS, APP_CONSTS) 
	  {
			switch(mapView.current)
			{
				case APP_CONSTS.MAPVIEW_DEFAULT_PATH:
					mapService.showNeighborhoodLayers();
				break;
				case APP_CONSTS.MAPVIEW_LOCATION_PATH:
					mapService.showStreetsNear({ lng: parseFloat($stateParams.lng), lat: parseFloat($stateParams.lat) })
								.then(function(result) {
									if ($stateParams.streetId) mapService.selectStreet($stateParams.streetId);
								});  
				break;
				case APP_CONSTS.MAPVIEW_CURRENTUSER_PATH:     
					mapService.showUserStreets()
								.then(function(result) {
									if ($stateParams.streetId) mapService.selectStreet($stateParams.streetId);
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
	