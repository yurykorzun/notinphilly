import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

cityId = ObjectId('58ab61c60113252c4c3437fa')

client = MongoClient('mongodb://localhost:27017/')

db = client.notinphilly_new

collection = db.zipcodes

streets = db.streets

print "Inserting..."

cursor = collection.find()
for record in cursor:
    record["totalStreets"] = streets.count({'zipCode': ObjectId(record["_id"])})

    UpdateResult = collection.update_one({"_id": ObjectId(record["_id"])}, {'$set' : {"totalStreets": record["totalStreets"]}})

print "Done.."

