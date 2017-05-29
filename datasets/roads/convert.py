import os
import json

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'source\UpperDarby.geojson'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

mappedRecords = []

for feature in jsonParsed["features"]:
    sourceProperties = feature["properties"]

    if "name" in sourceProperties:
        record = {}
        record["name"] = sourceProperties["name"]
        record["neighborhood"] = ""      
        record["zipCode"] = ""    
        record["totalAdopters"] = 0  

        record["geometry"] = feature["geometry"]

        mappedRecords.append(record)

print "Exporting.."
with open(os.path.join(currentDirPath, 'converted\UpperDarby.geojson'), 'w') as outfile:
    json.dump(mappedRecords, outfile)

print "Done"