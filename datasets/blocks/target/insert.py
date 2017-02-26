import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

cityId = ObjectId('58ab61c60113252c4c3437fa')

client = MongoClient('mongodb://localhost:27017/')

db = client.notinphilly_new
collection = db.blocks
collection.drop()

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'Philadelphia.json'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

print "Inserting.. {0}".format(len(jsonParsed))

for record in jsonParsed:
    record["cityId"] = cityId
    insertedId = collection.insert_one(record).inserted_id

print "Done.."

