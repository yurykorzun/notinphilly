echo "Started importing notinphilly db..."

set host="localhost"
set database="notinbaltimore"
set port="27017"

echo %host% %port% %database% %user% %password%

call mongoimport -h %host% --port %port% -d %database% -c blocks --file  .\baltimore\blocks_export.json

call mongoimport -h %host% --port %port% -d %database%  -c city --file .\baltimore\city_export.json

call mongoimport -h %host% --port %port% -d %database% -c neighborhoods --file .\baltimore\neighborhoods_export.json

call mongoimport -h %host% --port %port% -d %database% -c roles --file .\baltimore\roles_export.json

call mongoimport -h %host% --port %port% -d %database% -c states --file .\baltimore\states_export.json

call mongoimport -h %host% --port %port% -d %database% -c streets --file .\baltimore\streets_export.json

call mongoimport -h %host% --port %port% -d %database% -c userProfiles --file .\baltimore\userProfiles_export.json

call mongoimport -h %host% --port %port% -d %database%  -c zipcodes --file .\baltimore\zipcodes_export.json


echo "Finished importing db..." 
