echo "Started importing notinphilly db..."

set host="localhost"
set database="notinphilly"
set port="27017"
set folder=philadelphia

echo %host% %port%

call mongoimport -h %host% --port %port% -d %database% -c blocks --file  .\%folder%\blocks_export.json

call mongoimport -h %host% --port %port% -d %database%  -c city --file .\%folder%\city_export.json

call mongoimport -h %host% --port %port% -d %database% -c neighborhoods --file .\%folder%\neighborhoods_export.json

call mongoimport -h %host% --port %port% -d %database% -c roles --file .\%folder%\roles_export.json

call mongoimport -h %host% --port %port% -d %database% -c states --file .\%folder%\states_export.json

call mongoimport -h %host% --port %port% -d %database% -c streets --file .\%folder%\streets_export.json

call mongoimport -h %host% --port %port% -d %database% -c userProfiles --file .\%folder%\userProfiles_export.json

call mongoimport -h %host% --port %port% -d %database%  -c zipcodes --file .\%folder%\zipcodes_export.json

call mongo %database% --port %port% --eval "db.getCollection('neighborhoods').createIndex( { 'geometry' : '2dsphere' })"

call mongo %database% --port %port% --eval "db.getCollection('streets').createIndex( { 'geometry' : '2dsphere' })"

call mongo %database% --port %port% --eval "db.getCollection('zipcodes').createIndex( { 'geometry' : '2dsphere' })"

echo "Finished importing db..." 
