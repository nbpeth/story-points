# Story Points

## Development server

* Compile the app `ng build --watch` 
* Start the server to serve static content and run the websocket/http servers `PORT=4200 node server.js`

## Configuration
Story Points connects to a mysql db of your choice
* Apply the database schema and patches to your database from `db_seed/db_ddl.sql`
Environment variables are required:
* SPMYSQL_URL=<mysql://username:password@host/db?reconnect=true">
* SPPASSWORD=<mysql-password>
* SPUSER=<mysql-username>
* SP_CLIENT_ID=<google-oath-client-id>

export SPMYSQL_URL="mysql://b1429845583306:8451b970@us-cdbr-east-06.cleardb.net/heroku_87b34e619065b87?reconnect=true"
export SPPASSWORD="8451b970"
export SPUSER="b1429845583306"
export SPHOST="us-cdbr-east-06.cleardb.net/heroku_87b34e619065b87"
export SP_API_KEY="superKeyXXX"
export SP_CLIENT_ID="169440150514-6p8qrgf59kceaonb8qvpk10jam8gmaho.apps.googleusercontent.com"

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
