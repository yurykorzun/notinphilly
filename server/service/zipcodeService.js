var lodash              = require('lodash');
var mongoose            = require('mongoose');
var ZipcodeModel        = require('../api/zipcode/zipcode.model');

exports.getAllGeoJSON = function() {
	return new Promise(function (fulfill, reject)
	{
		ZipcodeModel.find({}, function(err, zipcodes) {
			if (err) {
                logger.error("zipcodeService.getAllGeoJSON " + err);                                 
                reject("Failed retrieving zipcodes " + err);
            } 
			var geoJSON = lodash.reduce(zipcodes, function(geoJSON, item){
				if(!geoJSON) geoJSON = [];
	
				var feature = {
					"type" : "Feature",
					"geometry": item["geometry"]
				};
	
				item["geometry"] = undefined;
				feature.properties = item;
				geoJSON.push(feature);
	
				return geoJSON;
			}, []);
	
			fulfill(geoJSON);
		});
	});
}