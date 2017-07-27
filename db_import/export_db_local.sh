#!/bin/bash
echo "Started importing notinphilly db..."

host=localhost
port=27017
database="notinphilly"
folder=philadelphia

echo $host $port $database $folder

mongoexport -h $host --port $port -d $database -c blocks -o ./$folder/neighborhoods_export.json

mongoexport -h $host --port $port -d $database -c city -o ./$folder/city_export.json

mongoexport -h $host --port $port -d $database -c neighborhoods -o ./$folder/neighborhoods_export.json

mongoexport -h $host --port $port -d $database -c roles -o ./$folder/roles_export.json

mongoexport -h $host --port $port -d $database -c states -o ./$folder/states_export.json

mongoexport -h $host --port $port -d $database -c streets -o ./$folder/streets_export.json

mongoexport -h $host --port $port -d $database -c userProfiles -o ./$folder/userProfiles_export.json

mongoexport -h $host --port $port -d $database -c zipCodes -o ./$folder/zipcodes_export.json

echo "Finished exporting db..." 


