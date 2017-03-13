echo "Started importing notinphilly db..."

set host="localhost"
set database="notinphilly"
set port="52636"
set user="admin"
set password="vW68tuLD-5DS"

echo %host% %port% %database% %user% %password%

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c blocks --file  .\philadelphia\blocks_export.json

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c city --file .\philadelphia\city_export.json

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c neighborhoods --file .\philadelphia\neighborhoods_export.json

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c roles --file .\philadelphia\roles_export.json

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c states --file .\philadelphia\states.json

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c streets --file .\philadelphia\streets_export.json

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c userProfiles --file .\philadelphia\userProfiles_export.json

call mongoimport -h %host% --port %port% -d %database% -u %user% -p %password% --authenticationDatabase admin -c zipcodes --file .\philadelphia\zipcodes_export.json

echo "Finished importing db..." 
