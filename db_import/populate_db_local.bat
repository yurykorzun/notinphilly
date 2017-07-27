echo "Started importing notinphilly db..."

set host="localhost"
set database="notinpittsburgh"
set port="27017"
set folder=philadelphia

echo %host% %port%


call mongoimport -h %host% --port %port% -d %database% -c roles --file .\%folder%\roles_export.json

call mongoimport -h %host% --port %port% -d %database% -c states --file .\%folder%\states_export.json

call mongoimport -h %host% --port %port% -d %database% -c userProfiles --file .\%folder%\userProfiles_export.json

echo "Finished populating db..." 
