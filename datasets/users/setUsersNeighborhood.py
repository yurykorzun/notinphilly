import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
import googlemaps

client = MongoClient('mongodb://localhost:27017/')

db = client.notinphilly
collection = db.userProfiles
neighborhoods = db.neighborhoods
zipcodes = db.zipcodes

userRecords = []
cursor = collection.find({"addressLocation": {"$exists": True}})
for record in cursor:
    userRecords.append(record)


totalCount = len(userRecords)
print "Updating " + str(totalCount) + " ..."
index = 0
for userRecord in userRecords:
    index += 1
    print str(index) + " of " + str(totalCount)

    coordinates = userRecord["addressLocation"]
    coordinates = [coordinates["lng"], coordinates["lat"]]

    query = { 'geometry':
            { '$geoIntersects': { 
                '$geometry': {
                    'type': "Point",
                    'coordinates':coordinates
                }
            }}
        }

    neighborhoodResult = neighborhoods.find_one(query)
    zipcodeResult = zipcodes.find_one(query)

    if neighborhoodResult and zipcodeResult:
        print "{0} {1} {2} {3} {4}".format(index, userRecord["firstName"], neighborhoodResult["name"], zipcodeResult["zipcode"], userRecord["fullAddress"])


        UpdateResult = collection.update_one({"_id": userRecord["_id"]}, 
                                            {
                                            '$set' : {
                                                "zipCode":  zipcodeResult["_id"], "neighborhood": neighborhoodResult["_id"]
                                            }
                                            })
    else:
        print "{0} {1} {2} {3}".format(index, userRecord["_id"], userRecord["firstName"], userRecord["fullAddress"])
        

print "Done.."