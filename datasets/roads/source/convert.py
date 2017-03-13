import os
import json

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'Philadelphia.geojson'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

mappedRecords = []

for feature in jsonParsed["features"]:
    sourceProperties = feature["properties"]

    record = {}
    record["name"] = sourceProperties["FULLNAME"] 
    record["totalAdopters"] = 0  

    record["geometry"] = feature["geometry"]

    mappedRecords.append(record)

print "Exporting.."
with open(os.path.join(currentDirPath, 'Philadelphia_output.geojson'), 'w') as outfile:
    json.dump(mappedRecords, outfile)

print "Done"