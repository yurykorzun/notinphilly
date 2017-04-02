import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
import googlemaps

client = MongoClient('mongodb://localhost:27017/')
gmaps = googlemaps.Client(key='AIzaSyBqpZiazl7tIseDBfqJM-Fh2Ky8m7QTj8A')

db = client.notinphilly
collection = db.userProfiles

query = {"$and" : [{"addressLocation": {"$exists": False}}, {"fullAddress": {"$exists": True}}]}

totalCount = collection.count(query)
cursor = collection.find(query)

print totalCount

index = 0
for record in cursor:
    index += 1

    fullAddress = record["fullAddress"]

    if fullAddress:
        geocode_result = gmaps.geocode(fullAddress)
        if (len(geocode_result) > 0):
            location = geocode_result[0]['geometry']['location']
            
            print "{0} {1} {2}".format(index, fullAddress, location) 

            UpdateResult = collection.update_one({"_id": ObjectId(record["_id"])}, {'$set' : {"addressLocation": location}})

query =  {"$and" : [{"addressLocation": {"$exists": False}}, {"$and": [{"$and": [{"streetNumber": {"$ne": ""}}, {"streetNumber": {"$exists": True}}] }, {"$and": [{"streetName": {"$ne": ""}}, {"streetName": {"$exists": True}}] },{"$and": [{"city": {"$ne": ""}}, {"city": {"$exists": True}}] },{"$and": [{"zip": {"$ne": ""}}, {"zip": {"$exists": True}}] }]}]}

totalCount = collection.count(query)
cursor = collection.find(query)

print totalCount

index = 0
for record in cursor:
    index += 1

    fullAddress =  "{0} {1}, {2}, PA, {3}".format(record["streetNumber"], record["streetName"], record["city"], record["zip"]) 

    if fullAddress:
        geocode_result = gmaps.geocode(fullAddress)
        if (len(geocode_result) > 0):
            location = geocode_result[0]['geometry']['location']
            
            print "{0} {1} {2}".format(index, fullAddress, location) 

            UpdateResult = collection.update_one({"_id": ObjectId(record["_id"])}, {'$set' : {"addressLocation": location, "fullAddress": fullAddress}})


print "Done.."