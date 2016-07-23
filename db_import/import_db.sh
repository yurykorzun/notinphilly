#!/bin/bash
echo "Started importing notinphilly db..."
 
host=localhost
port=27017
database="notinphilly"


mongoimport -h $host --port $port -d $database -c neighborhoods --authenticationDatabase admin --file neighborhoods_export.json

mongoimport -h $host --port $port -d $database -c roles --authenticationDatabase admin --file roles_export.json

mongoimport -h $host --port $port -d $database -c sessions --authenticationDatabase admin --file sessions_export.json

mongoimport -h $host --port $port -d $database -c states --authenticationDatabase admin --file states_export.json

mongoimport -h $host --port $port -d $database -c streetNames --authenticationDatabase admin --file streetNames_export.json

mongoimport -h $host --port $port -d $database -c streetSegments --authenticationDatabase admin --file streetSegments_export.json

mongoimport -h $host --port $port -d $database -c userProfiles --authenticationDatabase admin --file userProfiles_export.json

mongoimport -h $host --port $port -d $database -c userStats --authenticationDatabase admin --file userStats_export.json

mongoimport -h $host --port $port -d $database -c zipCodes --authenticationDatabase admin --file zipCodes_export.json

mongo --eval 'printjson(db.getCollection("streetSegments").createIndex( { "geodata.geometry" : "2dsphere" } ))'

echo "Finished importing db..." 
