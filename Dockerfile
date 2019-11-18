FROM node:12.2.0

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install
RUN npm run build

EXPOSE 8085

CMD [ "npm", "run", "start-server" ]

