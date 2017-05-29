import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db = client.notinbrooklyn

collection = db.neighborhoods

streets = db.streets

print "Updating..."

totalCount = collection.count({})
cursor = collection.find({})
index = 0
for record in cursor:
    index += 1
    neighborhoodId = ObjectId(record["_id"])
    record["totalStreets"] = streets.count({"neighborhoods" :  { "$elemMatch": { "$eq": neighborhoodId } }})

    print str(index) + " of " + str(totalCount) + str(record["_id"]) +  " " + str(record["totalStreets"])
 
    UpdateResult = collection.update_one({"_id": ObjectId(record["_id"])}, {'$set' : {"totalStreets": record["totalStreets"]}})

print "Done.."

