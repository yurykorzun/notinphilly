import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db_old = client.notinphilly_old
db = client.notinphilly

collection_old = db_old.streetSegments
collection = db.streets
collection.drop()

neighborhoods = db.neighborhoods
zipcodes = db.zipcodes

total = collection_old.count({})
cursor = collection_old.find({})

print "Inserting.. {0}".format(total)

newRecords = []
for record in cursor:
    new_record = {}

    new_record["_id"] = record["_id"]
    block = record["rightHundred"] if record["rightHundred"] != 0 else record["leftHundred"]
    blockNumber = str(block) + " Block of " if block != 0 else "" 
    new_record["name"] = "{0}{1} {2}".format(str(blockNumber), record["streetName"], record["type"] )   
    new_record["block"] =  record["rightHundred"]
    new_record["totalAdopters"] = record["totalAdopters"]   
    new_record["geometry"] = record["geodata"]["geometry"]
    new_record["active"] = True

    print str(new_record["name"])

    newRecords.append(new_record)
    insertedId = collection.insert_one(new_record).inserted_id

totalCount = len(newRecords)
print "Inserting " + str(totalCount) + " ..."
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
                                              "zipCodes":  zipcodeIds, "neighborhoods": neighborhoodIds
                                            }
                                        })
    
    print "{0} {1} {2} {3}".format(new_record["_id"], new_record["name"],  zipcodeIds, neighborhoodIds)

print "Done.."



