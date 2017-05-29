import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db = client.notinpittsburgh
collection = db.streets
collection.drop()

neighborhoods = db.neighborhoods
zipcodes = db.zipcodes

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'Pittsburgh.geojson'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

print "Inserting.. {0}".format(len(jsonParsed))

for record in jsonParsed:
    record["active"] = True
    insertedId = collection.insert_one(record).inserted_id

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

    if index > 6659:
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

        if neighborhoodResult and neighborhoodResult.retrieved != 0:
            for neighborhood in neighborhoodResult:
                neighborhoodIds.append(neighborhood["_id"])

        if zipcodeResult and zipcodeResult.retrieved != 0:
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

