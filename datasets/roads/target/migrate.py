import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

cityId = ObjectId('58ab61c60113252c4c3437fa')

client = MongoClient('mongodb://localhost:27017/')

db_old = client.notinphilly
db = client.notinphilly_new

collection_old = db_old.streetSegments
collection = db.streets
collection.drop()

neighborhoods = db.neighborhoods
zipcodes = db.zipcodes

cursor = collection_old.find({})

newRecords = []
for record in cursor:
    new_record = {}

    new_record["_id"] = record["_id"]
    blockNumber = record["rightHundred"] if record["rightHundred"] != 0 else "" 
    new_record["name"] = "{0} {1}{2}".format(record["streetName"], record["type"], " " + str(blockNumber))   
    new_record["block"] =  record["rightHundred"]
    new_record["totalAdopters"] = record["totalAdopters"]   
    new_record["geometry"] = record["geodata"]["geometry"]
    new_record["active"] = True

    newRecords.append(new_record)

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
    }}}

    neighborhood = neighborhoods.find_one(query)
    zipcode = zipcodes.find_one(query)

    if zipcode:
        new_record["zipCode"] = zipcode["_id"]
    if neighborhood:
        new_record["neighborhood"] = neighborhood["_id"]

    insertedId = collection.insert_one(new_record).inserted_id

print "Done.."



