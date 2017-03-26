import os
import json

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'philadelphia.geojson'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

mappedRecords = []

for feature in jsonParsed["features"]:
    sourceProperties = feature["properties"]

    record = {}
    record["name"] = sourceProperties["label"]
    record["cityId"] = ""
    record["percentageAdoptedStreets"] = 0
    record["totalAdoptedStreets"] = 0
    record["totalStreets"] = 0
    record["receivesSupplies"] = True
    record["geometry"] = feature["geometry"]

    mappedRecords.append(record)

print "Exporting.."
with open(os.path.join(currentDirPath, 'philadelphia_output.geojson'), 'w') as outfile:
    json.dump(mappedRecords, outfile)

print "Done"