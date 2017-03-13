echo "Started exporting notinphilly db..."

set host="localhost"
set database="notinbaltimore"
set port="27017"

echo %host% %port% %database% %user% %password%

call mongoexport -h %host% --port %port% -d %database% -c blocks -o .\baltimore\blocks_export.json
call mongoexport -h %host% --port %port% -d %database% -c city -o .\baltimore\city_export.json
call mongoexport -h %host% --port %port% -d %database% -c identitycounters -o .\baltimore\identitycounters_export.json
call mongoexport -h %host% --port %port% -d %database% -c neighborhoods -o .\baltimore\neighborhoods_export.json
call mongoexport -h %host% --port %port% -d %database% -c roles -o .\baltimore\roles_export.json
call mongoexport -h %host% --port %port% -d %database% -c states -o .\baltimore\states_export.json
call mongoexport -h %host% --port %port% -d %database% -c streets -o .\baltimore\streets_export.json
call mongoexport -h %host% --port %port% -d %database% -c toolsInventory -o .\baltimore\toolsInventory_export.json
call mongoexport -h %host% --port %port% -d %database% -c userProfiles -o .\baltimore\userProfiles_export.json
call mongoexport -h %host% --port %port% -d %database% -c zipcodes -o .\baltimore\zipcodes_export.json

echo "Finished importing db..." 


