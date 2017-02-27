import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

cityId = ObjectId('58ab61c60113252c4c3437fa')

client = MongoClient('mongodb://localhost:27017/')

db = client.notinbaltimore
collection = db.streets
collection.drop()

neighborhoods = db.neighborhoods
zipcodes = db.zipcodes

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'Baltimore.json'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

print "Inserting.. {0}".format(len(jsonParsed))

for record in jsonParsed:
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

    coordinates = new_record["geometry"]["coordinates"]

    query = { 'geometry':
    { '$geoIntersects': { 
        '$geometry': {
            'type': "LineString",
            'coordinates':coordinates
        }
    }}}

    neighborhood = neighborhoods.find_one(query)
    zipcode = zipcodes.find_one(query)

    zipcodeId = zipcode["_id"] if zipcode else ""
    neighborhoodId = neighborhood["_id"] if neighborhood else "" 

    UpdateResult = collection.update_one({"_id": new_record["_id"]}, 
                                        {
                                          '$set' : {
                                              "zipCode":  zipcodeId, "neighborhood": neighborhoodId
                                            }
                                        })

print "Done.."

