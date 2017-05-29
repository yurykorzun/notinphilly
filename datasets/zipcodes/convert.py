import os
import json

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'source\UpperDarby.geojson'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

mappedRecords = []

for feature in jsonParsed["features"]:
    sourceProperties = feature["properties"]

    record = {}
    record["zipcode"] = sourceProperties["ZIP"]
    record["cityId"] = ""
    record["percentageAdoptedStreets"] = 0 
    record["totalAdoptedStreets"] = 0 
    record["totalStreets"] = 0        
    record["geometry"] = feature["geometry"]

    mappedRecords.append(record)

print "Exporting.."
with open(os.path.join(currentDirPath, 'converted\UpperDarby.geojson'), 'w') as outfile:
    json.dump(mappedRecords, outfile)

print "Done"