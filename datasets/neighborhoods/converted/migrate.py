import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

cityId = ObjectId('58ab61c60113252c4c3437fa')

client = MongoClient('mongodb://localhost:27017/')

db_old = client.notinphilly
db = client.notinphilly_new

collection_old = db_old.neighborhoods
collection = db.neighborhoods
collection.drop()

cursor = collection_old.find({})

print "Inserting..."

for record in cursor:
    new_record = {}
    new_record["_id"] = record["_id"]
    new_record["cityId"] = cityId
    new_record["name"] = record["name"]
    new_record["percentageAdoptedStreets"] = record["percentageAdoptedStreets"]
    new_record["totalAdoptedStreets"] = record["totalAdoptedStreets"]
    new_record["totalStreets"] = record["totalStreets"]
    new_record["geometry"] = record["geodata"]["geometry"]
    new_record["active"] = True

    insertedId = collection.insert_one(new_record).inserted_id

print "Done.."

