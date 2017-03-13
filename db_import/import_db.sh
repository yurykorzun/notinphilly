#!/bin/bash
echo "Started importing notinphilly db..."

host=localhost
port=27017
database="notinphilly"


mongoimport -h $host --port $port -d $database -c neighborhoods --authenticationDatabase admin --file db_import/neighborhoods_export.json

mongoimport -h $host --port $port -d $database -c roles --authenticationDatabase admin --file db_import/roles_export.json

mongoimport -h $host --port $port -d $database -c sessions --authenticationDatabase admin --file db_import/sessions_export.json

mongoimport -h $host --port $port -d $database -c states --authenticationDatabase admin --file db_import/states_export.json

mongoimport -h $host --port $port -d $database -c streets --authenticationDatabase admin --file db_import/streetSegments_export.json

mongoimport -h $host --port $port -d $database -c userProfiles --authenticationDatabase admin --file db_import/userProfiles_export.json

mongoimport -h $host --port $port -d $database -c zipCodes --authenticationDatabase admin --file db_import/zipCodes_export.json

mongo 'notinphilly' --eval 'printjson(db.getCollection("streets").createIndex( { "geometry" : "2dsphere" } ))'

echo "Finished importing db..."
