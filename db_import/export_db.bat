echo "Started exporting notinphilly db..."

set host="localhost"
set database="notinphilly2"
set port="27017"
set user="admin"
set password="rMTiC-LzzW1g"

echo %host% %port% %database% %user% %password%

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c neighborhoods --authenticationDatabase admin -o .\export\neighborhoods_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c requestStatuses --authenticationDatabase admin -o .\export\requestStatuses_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c toolRequests--authenticationDatabase admin -o .\export\toolRequests_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c toolsInventory authenticationDatabase admin -o .\export\toolsInventory_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c roles --authenticationDatabase admin -o .\export\roles_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c sessions --authenticationDatabase admin -o .\export\sessions_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c states --authenticationDatabase admin -o .\export\states_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c streetNames --authenticationDatabase admin -o .\export\streetNames_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c streetSegments --authenticationDatabase admin -o .\export\streetSegments_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c userProfiles --authenticationDatabase admin -o .\export\userProfiles_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c userStats --authenticationDatabase admin -o .\export\userStats_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c zipCodes --authenticationDatabase admin -o .\export\zipCodes_export.json

echo "Finished importing db..." 


