#!/bin/bash
echo "Started importing notinphilly db..."

host=
database=notinphilly
port=
user=
password=

echo $host $port $user $password

mongoexport -h $host --port $port -u $user -p $password -d $database -c neighborhoods --authenticationDatabase admin -o neighborhoods_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c roles --authenticationDatabase admin -o roles_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c sessions --authenticationDatabase admin -o sessions_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c states --authenticationDatabase admin -o states_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c streetNames --authenticationDatabase admin -o streetNames_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c streetSegments --authenticationDatabase admin -o streetSegments_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c userProfiles --authenticationDatabase admin -o userProfiles_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c userStats --authenticationDatabase admin -o userStats_export.json

mongoexport -h $host --port $port -u $user -p $password -d $database -c zipCodes --authenticationDatabase admin -o zipCodes_export.json

echo "Finished importing db..." 


