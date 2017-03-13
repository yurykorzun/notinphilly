import os
import json

currentDirPath = os.path.dirname(__file__)
jsonFile = open(os.path.join(currentDirPath, 'philadelphia.json'))
jsonString = jsonFile.read()
jsonParsed = json.loads(jsonString)

mappedRecords = []

for properties in jsonParsed:
    record = {}
    record["_id"] = properties["_id"]   

    blockNumber = properties["rightHundred"] if properties["rightHundred"] != 0 else "" 
    if blockNumber != "":
        record["name"] = "{0} block of {1} {2}".format(blockNumber, properties["streetName"], properties["type"]) 
    else:
        record["name"] = "{1} {2}".format(blockNumber, properties["streetName"], properties["type"])

    record["block"] =  properties["rightHundred"]
    record["totalAdopters"] = properties["totalAdopters"]   

    record["geometry"] = properties["geodata"]["geometry"]

    mappedRecords.append(record)

print "Exporting.."
with open(os.path.join(currentDirPath, 'Philadelphia_output.json'), 'w') as outfile:
    json.dump(mappedRecords, outfile)

print "Done"