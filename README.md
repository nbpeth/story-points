# Story Points

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.1.

## Development server

For reloading changes to UI (still requires refresh of browser):

- `dc up -d db`
- `ng build --watch=true`
- `cd go/`
- `SPHOST=localhost SPUSER=user SPPASSWORD=password SPPORT=3306 SPDB=storypoints go run main.go`
- navigate to `http://localhost:8081`

For easier build, but lacking auto rebuild:

- `dc up --build storypoints` for a dev server. 
- avigate to `https://story-points.app.returnpath.dnet/`.

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
