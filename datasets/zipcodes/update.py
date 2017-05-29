import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db = client.notinbrooklyn

collection = db.zipcodes

streets = db.streets

print "Inserting..."

totalCount = collection.count({})
cursor = collection.find({})
index = 0
for record in cursor:
    index += 1
    zipCodeId = ObjectId(record["_id"])
    record["totalStreets"] = streets.count({"zipCodes" :  { "$elemMatch": { "$eq": zipCodeId } }})

    print str(index) + " of " + str(totalCount) + str(record["_id"]) +  " " + str(record["totalStreets"])
 
    UpdateResult = collection.update_one({"_id": ObjectId(record["_id"])}, {'$set' : {"totalStreets": record["totalStreets"]}})

print "Done.."