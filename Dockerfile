FROM node:12.2.0

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install -g @angular/cli
RUN npm install
RUN npm run build
