echo "Started exporting notinphilly db..."

set host="localhost"
set database="notinphilly"
set port="27017"

echo %host% %port% %database% %user% %password%

call mongoexport -h %host% --port %port% -d %database% -c blocks -o .\philadelphia\blocks_export.json
call mongoexport -h %host% --port %port% -d %database% -c city -o .\philadelphia\city_export.json
call mongoexport -h %host% --port %port% -d %database% -c identitycounters -o .\philadelphia\identitycounters_export.json
call mongoexport -h %host% --port %port% -d %database% -c neighborhoods -o .\philadelphia\neighborhoods_export.json
call mongoexport -h %host% --port %port% -d %database% -c roles -o .\philadelphia\roles_export.json
call mongoexport -h %host% --port %port% -d %database% -c states -o .\philadelphia\states_export.json
call mongoexport -h %host% --port %port% -d %database% -c streets -o .\philadelphia\streets_export.json
call mongoexport -h %host% --port %port% -d %database% -c toolsInventory -o .\philadelphia\toolsInventory_export.json
call mongoexport -h %host% --port %port% -d %database% -c userProfiles -o .\philadelphia\userProfiles_export.json
call mongoexport -h %host% --port %port% -d %database% -c zipcodes -o .\philadelphia\zipcodes_export.json

echo "Finished importing db..." 


