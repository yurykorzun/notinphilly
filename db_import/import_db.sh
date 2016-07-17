#!/bin/bash
echo "Started importing notinphilly db..."

host=$1
database=$2
port=$3
user=$4
password=$5

echo $host $database $port $user $password

mongoimport -h $host --port $port -u $user -p $password -d $database -c neighborhoods --authenticationDatabase admin --file neighborhoods_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c roles --authenticationDatabase admin --file roles_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c sessions --authenticationDatabase admin --file sessions_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c states --authenticationDatabase admin --file states_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c streetNames --authenticationDatabase admin --file streetNames_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c streetSegments --authenticationDatabase admin --file streetSegments_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c userProfiles --authenticationDatabase admin --file userProfiles_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c userStats --authenticationDatabase admin --file userStats_export.json

mongoimport -h $host --port $port -u $user -p $password -d $database -c zipCodes --authenticationDatabase admin --file zipCodes_export.json

echo "Finished importing db..." 


