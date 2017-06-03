echo "Started exporting notinphilly db..."

set host="localhost"
set database="notinphilly"
set port="27017"
set folder=philadelphia

echo %host% %port%

call mongoexport -h %host% --port %port% -d %database% -c blocks -o .\%folder%\blocks_export.json
call mongoexport -h %host% --port %port% -d %database% -c city -o .\%folder%\city_export.json
call mongoexport -h %host% --port %port% -d %database% -c neighborhoods -o .\%folder%\neighborhoods_export.json
call mongoexport -h %host% --port %port% -d %database% -c roles -o .\%folder%\roles_export.json
call mongoexport -h %host% --port %port% -d %database% -c states -o .\%folder%\states_export.json
call mongoexport -h %host% --port %port% -d %database% -c streets -o .\%folder%\streets_export.json
call mongoexport -h %host% --port %port% -d %database% -c userProfiles -o .\%folder%\userProfiles_export.json
call mongoexport -h %host% --port %port% -d %database% -c zipcodes -o .\%folder%\zipcodes_export.json

echo "Finished exporting db..." 


