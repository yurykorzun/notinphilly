import os
import json
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')

db = client.notinphilly_new
collection = db.city

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'Philadelphia.json'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

print "Inserting.. {0}".format(len(jsonParsed))

for feature in jsonParsed:
    insertedId = collection.insert_one(feature).inserted_id

print "Done.."

