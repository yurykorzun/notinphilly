import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db = client.notinphilly
collection = db.userProfiles

query = {"$and" : [{"addressLocation": {"$exists": True}}]}

totalCount = collection.count(query)
cursor = collection.find(query)

print totalCount

index = 0
for record in cursor:
    index += 1

    addressLocation = record["addressLocation"]
    if addressLocation:
        addressGeo = {
                "type" : "Point",
                "coordinates" : [ 
                        addressLocation["lng"], 
                        addressLocation["lat"]
                ]
            }

        print "{0} {1} {2}".format(index, addressLocation, addressGeo) 

        UpdateResult = collection.update_one({"_id": ObjectId(record["_id"])}, {'$set' : {"addressGeo": addressGeo}})
        

