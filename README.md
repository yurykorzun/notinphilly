# notinphilly

**Concept**: In return for a commitment to go out once a week to pick up the litter on a block, we supply citizens of Philadelphia with a trash grabber.

Email you questions to notinphilly@gmail.com

[Project page](https://codeforphilly.org/projects/not_in_philly-2/)


To run the app locally:

1. Git clone the solution.
2. Install *nodejs*, *npm*, *bower*, and *mongodb*.
3. Run `npm install` in the local project folder.
4. Run `bower install`.
5. Run db_import\import_db.sh to create and seed the database. 
6. In a separate terminal, run the database server with `mongo --dbpath=db_import`.
7. Run `node server`, you can now access the server at `http://localhost:8080`.
