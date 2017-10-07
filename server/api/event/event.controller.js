var google = require('googleapis');
var calendar = google.calendar('v3');
var nodeGeocoder = require('node-geocoder');
var apiSettings = require('../../config/apiSettings');
var logger      = require('../../components/logger');

var geocoderOptions = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: apiSettings.GOOGLE_API_KEY
};
var geocoder = nodeGeocoder(geocoderOptions);

exports.getGoogleEvents = function(req, res, next) {

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    calendar.events.list({ auth: apiSettings.GOOGLE_API_KEY, calendarId: apiSettings.GOOGLE_CALENDAR_ID, maxResults: 50, timeMin: yesterday.toISOString() }, function(error, response) {
        if (error) {
            logger.error(error);
            res.status(500).send('failed retrieving events');
        }
        else
        {
            if (response.items && response.items.length > 0)
            {
                var events = response.items.filter(function (event) {
                    return event.location;
                });
                var locations = events.map(function(event) {
                    return event.location;
                });

                geocoder.batchGeocode(locations, function (err, geoLocations) {
                    if (err) {
                        logger.error(err);
                        res.status(500).send('failed retrieving locations');
                    }
                    else
                    {
                        var eventsWithLocation = [];
                        for (var itemIndex = 0; itemIndex < events.length; itemIndex++)
                        {
                            var event = events[itemIndex];
                            var geoLocation = geoLocations[itemIndex];
                            if (!geoLocation.error && geoLocation.value && geoLocation.value.length > 0)
                            {
                                event.location = geoLocation.value[0];
                                eventsWithLocation.push(event);
                            }
                        }

                        res.status(200).json(eventsWithLocation);
                    }
                });
            }
            else
            {
                res.status(200).send([]);
            }
        }
    });
}