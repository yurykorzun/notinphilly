echo "Started exporting notinphilly db..."

set host="localhost"
set database="notinphilly2"
set port="27017"
set user="admin"
set password="rMTiC-LzzW1g"

echo %host% %port% %database% %user% %password%

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c blocks --authenticationDatabase admin -o .\export\blocks_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c neighborhoods --authenticationDatabase admin -o .\export\neighborhoods_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c roles --authenticationDatabase admin -o .\export\roles_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c states --authenticationDatabase admin -o .\export\states_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c streets --authenticationDatabase admin -o .\export\streets_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c userProfiles --authenticationDatabase admin -o .\export\userProfiles_export.json

call mongoexport -h %host% --port %port% -u %user% -p %password% -d %database% -c zipCodes --authenticationDatabase admin -o .\export\zipCodes_export.json

echo "Finished importing db..." 


