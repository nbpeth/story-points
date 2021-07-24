const cors = require('cors');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysqlClient = require('./mysqlClient');

const clientId = process.env.SP_LOGIN_AUD;

const startServer = () => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if(['production','test'].includes(process.env.ENV) && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(['https://', req.get('Host'), req.url].join(''));
    }

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
      console.error(`Invalid user: ${JSON.stringify(headers || {})}`)

      res.status(401);
      res.send({error: "You shall not pass!"})
    } else {
      createUser(req, res)
    }
  })

  app.post("/:sessionId/auth", (req, res) => {
    // rate limit
    const sessionId = req.params["sessionId"];
    const passcodeHash = req.headers.authorization;

    mysqlClient.verifySessionPassword(sessionId, (err, results) => {
      if(err) {
        res.status(500);
        res.send({error: "Something bad happened"});
      } else {
        const noSessionData = !results || results.length < 1;
        if (noSessionData) {
          res.status(401);
          res.send({error: "Invalid authorization for session"})
        }
        else {
          const row = results[0];
          const { id, passcode, passcode_enabled } = row;

          const validAuth = (id == sessionId && passcode === passcodeHash)
          if(!passcode_enabled || validAuth) {
            res.status(200);
            res.send({ok: "yay"})
          } else {
            res.status(401);
            res.send({error: "Invalid authorization for session"})
          }
        }
      }
    });
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
    const tokenAudienceIsCorrectClient = aud === clientId

    return tokenIsNotExpired && tokenAudienceIsCorrectClient
  } catch(e) {
    console.error("Validate Auth Error:", e)
    return false
  }
}

const createUser = (req, res) => {

  mysqlClient.createUser(req.body, (err, results) => {
    if (err) {
      console.error("Error creating user", err)
      res.status(500);
      res.send({error: err})
    } else {
      res.send(req.body);
    }
  })
}

mysqlClient.initDB(startServer)

module.exports = app;
