echo "Started importing notinphilly db..."

set host="localhost"
set database="notinphilly_old"
set port="27017"
set user="admin"
set password="rMTiC-LzzW1g"

echo %host% %port% %database% %user% %password%

call mongoimport -h %host% --port %port% -d %database% -c neighborhoods --file  .\export\neighborhoods_export.json

call mongoimport -h %host% --port %port% -d %database% -c requestStatuses --file .\export\requestStatuses_export.json

call mongoimport -h %host% --port %port% -d %database% -c toolRequests --file .\export\toolRequests_export.json

call mongoimport -h %host% --port %port% -d %database% -c toolsInventory --file .\export\toolsInventory_export.json

call mongoimport -h %host% --port %port% -d %database% -c roles --file .\export\roles_export.json

call mongoimport -h %host% --port %port% -d %database% -c sessions --file .\export\sessions_export.json

call mongoimport -h %host% --port %port% -d %database% -c states --file .\export\states_export.json

call mongoimport -h %host% --port %port% -d %database% -c streetNames --file .\export\streetNames_export.json

call mongoimport -h %host% --port %port% -d %database% -c streetSegments --file .\export\streetSegments_export.json

call mongoimport -h %host% --port %port% -d %database% -c userProfiles --file .\export\userProfiles_export.json

call mongoimport -h %host% --port %port% -d %database% -c userStats --file .\export\userStats_export.json

call mongoimport -h %host% --port %port% -d %database% -c zipCodes --file .\export\zipCodes_export.json

echo "Finished importing db..." 
