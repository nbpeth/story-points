const cors = require('cors');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysqlClient = require('./mysqlClient');

const clientId = process.env.SP_CLIENT_ID;

const startServer = () => {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.use(express.static(__dirname + '/dist/story-points'));

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(cors());

  app.post('/user', (req, res) => {
    const headers = req.headers
    const validUser = validateAuth(headers)

    if(!validUser) {
      res.status(401);
      res.send({error: "You shall not pass!"})
    } else {
      createUser(req, res)
    }
  })

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname + '/dist/story-points/index.html'));
  });
}

const validateAuth = (headers) => {
  try {
    const authorizationToken = headers["authorization"]
    const tokenClaims = authorizationToken.split(".")[1]
    const decoded = JSON.parse(new Buffer(tokenClaims, "base64").toString('ascii'))

    const { aud, exp } = decoded
    const expiration = new Date(exp * 1000)
    const tokenIsNotExpired = expiration > new Date()
    const tokenAudienceIsCorrectClient =  aud === clientId

    return tokenIsNotExpired && tokenAudienceIsCorrectClient
  } catch(e) {
    return false
  }
}

const createUser = (req, res) => {
  mysqlClient.createUser(req.body, (err) => {
    if (err) {
      console.error(err)
      res.status(500);
      res.send({error: err})
    } else {
      res.send(req.body);
    }
  })
}

mysqlClient.initDB(startServer)

module.exports = app;
