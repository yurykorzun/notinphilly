#!/bin/bash
echo "Started importing notinphilly db..."
 
host=localhost
port=27017
database="notinphilly"
folder=philadelphia

echo $host $port $database $folder

mongoimport -h $host --port $port -d $database -c blocks --file ./$folder/blocks_export.json && \

mongoimport -h $host --port $port -d $database -c city --file ./$folder/city_export.json && \

mongoimport -h $host --port $port -d $database -c neighborhoods --file ./$folder/neighborhoods_export.json && \

mongoimport -h $host --port $port -d $database -c roles --file ./$folder/roles_export.json && \

mongoimport -h $host --port $port -d $database -c states --file ./$folder/states_export.json && \

mongoimport -h $host --port $port -d $database -c streets --file ./$folder/streets_export.json && \

mongoimport -h $host --port $port -d $database -c userProfiles--file ./$folder/userProfiles_export.json && \

mongoimport -h $host --port $port -d $database -c zipCodes --file ./$folder/zipcodes_export.json && \

mongo $database --port $port --eval "db.getCollection('neighborhoods').createIndex( { 'geometry' : '2dsphere' })" && \

mongo $database --port $port --eval "db.getCollection('streets').createIndex( { 'geometry' : '2dsphere' })" && \

mongo $database --port $port --eval "db.getCollection('zipcodes').createIndex( { 'geometry' : '2dsphere' })" 

echo "Finished importing db..." 
