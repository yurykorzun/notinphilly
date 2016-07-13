#!/bin/bash
echo "Started importing notinphilly db..."

host=$1
database=$2
port=$3
user=$4
password=$5

echo $host $port $user $password

mongoimport -h $host --port $port -u $user -p $password -d $database -c neighborhoods --authenticationDatabase admin -f neighborhoods_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c roles --authenticationDatabase admin -f roles_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c sessions --authenticationDatabase admin -f sessions_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c states --authenticationDatabase admin -f states_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c streetNames --authenticationDatabase admin -f streetNames_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c streetSegments --authenticationDatabase admin -f streetSegments_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c userProfiles --authenticationDatabase admin -f userProfiles_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c userStats --authenticationDatabase admin -f userStats_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c zipCodes --authenticationDatabase admin -f zipCodes_export.json

echo "Finished importing db..." 


