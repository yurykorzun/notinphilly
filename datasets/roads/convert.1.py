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
    record["name"] = "{0} {1} {2}".format(properties["streetName"],properties["type"], properties["rightHundred"])   
    record["block"] =  properties["rightHundred"]
    record["zipCode"] = properties["zipLeft"] 
    record["neighborhood"] = ""
    record["totalAdopters"] = properties["totalAdopters"]   

    record["geometry"] = properties["geodata"]["geometry"]

    mappedRecords.append(record)

print "Exporting.."
with open(os.path.join(currentDirPath, 'Philadelphia_output.json'), 'w') as outfile:
    json.dump(mappedRecords, outfile)

print "Done"