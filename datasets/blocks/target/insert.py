import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb://localhost:27017/')

db = client.notinbaltimore
collection = db.blocks
collection.drop()

city = db.city.find_one({})

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'Philadelphia.json'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

print "Inserting.. {0}".format(len(jsonParsed))

for record in jsonParsed:
    record["cityId"] = city["_id"]
    record["active"] = True

    insertedId = collection.insert_one(record).inserted_id

print "Done.."

