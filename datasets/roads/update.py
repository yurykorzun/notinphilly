import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db = client.notinpittsburgh
collection = db.streets

city = db.city.find_one({})
neighborhoods = db.neighborhoods
zipcodes = db.zipcodes

cityId = city["_id"]

newRecords = []
cursor = collection.find({})
for record in cursor:
    newRecords.append(record)

print "Done..."

totalCount = len(newRecords)
print "Updating " + str(totalCount) + " ..."
index = 0
for new_record in newRecords:
    index += 1
    print str(index) + " of " + str(totalCount)

    coordinates = new_record["geometry"]["coordinates"]

    query = { 'geometry':
            { '$geoIntersects': { 
                '$geometry': {
                    'type': "LineString",
                    'coordinates':coordinates
                }
            }}
        }

    neighborhoodResult = neighborhoods.find(query)
    zipcodeResult = zipcodes.find(query)
    neighborhoodIds = []
    zipcodeIds = []

    try:
        if neighborhoodResult:
            for neighborhood in neighborhoodResult:
                neighborhoodIds.append(neighborhood["_id"])
    except:
        print "Failed finding neighborhood"

    try:
        if zipcodeResult:
            for zipcode in zipcodeResult:
                zipcodeIds.append(zipcode["_id"])
    except:
        print "Failed finding zipcode"

    UpdateResult = collection.update_one({"_id": new_record["_id"]}, 
                                        {
                                            '$set' : {
                                                "zipCodes":  zipcodeIds, "neighborhoods": neighborhoodIds
                                            }
                                        })

    print "{0} {1} {2} {3}".format(new_record["_id"], new_record["name"],  zipcodeIds, neighborhoodIds)

print "Done.."

