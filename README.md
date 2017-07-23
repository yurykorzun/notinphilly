# notinphilly

**Concept**: In return for a commitment to go out once a week to pick up the litter on a block, we supply citizens of Philadelphia with a trash grabber.


Email you questions to notinphilly@gmail.com

[Project page](https://codeforphilly.org/projects/not_in_philly-2/)


To run the app locally:

## Install dependencies

1. Git clone the solution.
2. Install *nodejs*, *npm*, *bower*, and *mongodb*.
3. Run `npm install` in the local project root folder.
4. Run `bower install` in the local project root folder.

## Set Up the Database

1. Ensure `mongodb` is running ([different depending on your install method](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/))
2. Move to the database operations directory `cd db_import`
3. Run `sh db_import/import_db_local.sh` in terminal to create and seed the database.

## Set up App

1. Contact [Yury](notinphilly@gmail.com) for `apiSettings.js` and `serverSettings.js` values.
2. Populate api keys and server settings in server/config.

## Run the App
1. Run node server, you can now access the server at http://localhost:8080.
