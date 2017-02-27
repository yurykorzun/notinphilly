import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db = client.notinbaltimore

collection = db.neighborhoods

streets = db.streets

print "Inserting..."

cursor = collection.find({})
for record in cursor:
    record["totalStreets"] = streets.count({'neighborhood': ObjectId(record["_id"])})

    UpdateResult = collection.update_one({"_id": ObjectId(record["_id"])}, {'$set' : {"totalStreets": record["totalStreets"]}})

print "Done.."

