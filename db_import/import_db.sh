#!/bin/bash
echo "Started importing notinphilly db..."

host=127.0.0.1
database=notinphilly
port=27017
user=
password=

echo $host $port $user $password

mongoimport -h $host --port $port -d $database -c neighborhoods -f neighborhoods_export.json

mongoimport -h $host --port $port -d $database -c roles -f roles_export.json

mongoimport -h $host --port $port -d $database -c sessions -f sessions_export.json

mongoimport -h $host --port $port -d $database -c states -f states_export.json

mongoimport -h $host --port $port -d $database -c streetNames -f streetNames_export.json

mongoimport -h $host --port $port -d $database -c streetSegments -f streetSegments_export.json

mongoimport -h $host --port $port -d $database -c userProfiles -f userProfiles_export.json

mongoimport -h $host --port $port -d $database -c userStats -f userStats_export.json

mongoimport -h $host --port $port -d $database -c zipCodes -f zipCodes_export.json

echo "Finished importing db..." 


