import os
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
import shapely
from shapely.geometry import *

client = MongoClient('mongodb://localhost:27017/')

db = client.notinpittsburgh
sourceCollection = db.streets
splitCollection = db.streetsSplit

print "Loading streets..."

streetRecords = []
cursor = sourceCollection.find({})
for record in cursor:
    streetRecords.append(record)

print "Done..."

totalCount = len(streetRecords)
print "Processing " + str(totalCount) + " ..."

index = 0
for street in streetRecords:
    index += 1
    print str(index) + " of " + str(totalCount)

    coordinates = street["geometry"]["coordinates"]

    query = { '$and' : [

        { 
            'geometry':
            { '$geoIntersects': { 
                '$geometry': {
                    'type': "LineString",
                    'coordinates': coordinates
                } }}}, 
            {'_id' : { '$ne' : street['_id']}}] 
        }

    intersectedStreets = sourceCollection.find(query)
    intersectedStreets = list(intersectedStreets)

    streetLineString = LineString(coordinates)

    intersectionPoints = []
    for intersectedStreet in intersectedStreets:
        intersectedCoordinates = intersectedStreet["geometry"]["coordinates"]
        intersectedLineString = LineString(intersectedCoordinates)
        intersection = streetLineString.intersection(intersectedLineString)

        intersectionPoints.append(intersection)

    if len(intersectionPoints) > 0:
        splitLineStrings = cut_line_at_points(streetLineString, intersectionPoints)

        for splitLineString in splitLineStrings:
            newSplitStreet = street
            newSplitStreet['_id'] = None
            newSplitStreet["geometry"]["coordinates"] = splitLineString.coords

    print str(index) + " found intersections" + str(len(intersectedStreets))


def cut_line_at_points(line, points):

    # First coords of line
    coords = list(line.coords)

    # Keep list coords where to cut (cuts = 1)
    cuts = [0] * len(coords)
    cuts[0] = 1
    cuts[-1] = 1

    # Add the coords from the points
    coords += [list(p.coords)[0] for p in points]    
    cuts += [1] * len(points)        

    # Calculate the distance along the line for each point    
    dists = [line.project(Point(p)) for p in coords]    
​
    # sort the coords/cuts based on the distances    
    # see http://stackoverflow.com/questions/6618515/sorting-list-based-on-values-from-another-list    
    coords = [p for (d, p) in sorted(zip(dists, coords))]    
    cuts = [p for (d, p) in sorted(zip(dists, cuts))]          

    # generate the Lines    
    #lines = [LineString([coords[i], coords[i+1]]) for i in range(len(coords)-1)]    
    lines = []        

    for i in range(len(coords)-1):    
        if cuts[i] == 1:    
            # find next element in cuts == 1 starting from index i + 1   
            j = cuts.index(1, i + 1)    
            lines.append(LineString(coords[i:j+1]))            

    return lines