(function () {
  angular.module('notinphillyServerApp')
    .service('placeSearchService', ['$http', '$rootScope', '$q', function($http, $rootScope, $q) {
      var placeService = new google.maps.places.PlacesService(document.createElement('div'));

      this.getAddressByPlaceId = function(placeId) {
        var deferred = $q.defer();

        getByPlaceId(placeId).then(function(addressDetails) {
          deferred.resolve(addressDetails);
        });

        return deferred.promise;
      }

      this.getAddressByText = function(fullAddress) {
        var deferred = $q.defer();
        var request = {
               query: fullAddress
           };

        placeService.textSearch(request, function(textSearchResult, status) {
          if(status === "OK" && textSearchResult && textSearchResult.length > 0)
          {
            var foundAddress = textSearchResult[0];
            getByPlaceId(foundAddress.place_id).then(function(addressDetails) {
              deferred.resolve(addressDetails);
            });
          }
        });

        return deferred.promise;
      }

      this.parseAddressResult = function(addressDetails)
      {
        return extractAddress(addressDetails);
      }

      function getByPlaceId(placeId)
      {
        var deferred = $q.defer();

        placeService.getDetails({ placeId: placeId }, function(detailsResult, status) {
          if(status === "OK" && detailsResult)
          {
            if(detailsResult)
            {
              var details = extractAddress(detailsResult);
              deferred.resolve(details);
            }
          }
        });

        return deferred.promise;
      }

      function extractAddress(addressDetails)
      {
        var location = {
          lat: addressDetails.geometry.location.lat(),
          lng: addressDetails.geometry.location.lng()
        };
        var address = {
          fullAddress: addressDetails.formatted_address,
          streetNumber: getAddressComponent(addressDetails, 'street_number', 'short'),
          streetName: getAddressComponent(addressDetails, 'route', 'short'),
          city: getAddressComponent(addressDetails, 'locality', 'short'),
          state: getAddressComponent(addressDetails, 'administrative_area_level_1', 'short'),
          postalCode: getAddressComponent(addressDetails, 'postal_code', 'short'),
          country: getAddressComponent(addressDetails, 'country', 'short'),
          location: location,
          placeId: addressDetails.place_id
        };

        return address;
      }

      function getAddressComponent(address, component, type) {
        var element = null;
        angular.forEach(address.address_components, function (address_component) {
          if (address_component.types[0] == component) {
            element = (type == 'short') ? address_component.short_name : address_component.long_name;
          }
        });

        return element;
      }
    }]);
  })();
