import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

cityId = ObjectId('58ab61c60113252c4c3437fa')

client = MongoClient('mongodb://localhost:27017/')

db = client.notinbaltimore
collection = db.streets

neighborhoods = db.neighborhoods
zipcodes = db.zipcodes

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
    for neighborhood in neighborhoodResult:
        neighborhoodIds.append(neighborhood["_id"])
    
    zipcodeIds = []
    for zipcode in zipcodeResult:
        zipcodeIds.append(zipcode["_id"])

    UpdateResult = collection.update_one({"_id": new_record["_id"]}, 
                                        {
                                          '$set' : {
                                              "zipCodes":  neighborhoodIds, "neighborhoods": zipcodeIds
                                            }
                                        })
    
    print "{0} {1} {2} {3}".format(new_record["_id"], new_record["name"],  zipcodeIds, neighborhoodIds)

print "Done.."

