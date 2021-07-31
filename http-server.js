const cors = require('cors');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysqlClient = require('./mysqlClient');
const {validateIdToken, generateJWT} = require('./authClient')


const startServer = () => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if (['production', 'test'].includes(process.env.ENV) && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(['https://', req.get('Host'), req.url].join(''));
    }

    next();
  });

  app.use(express.static(__dirname + '/dist/story-points'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(cors());

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname + '/dist/story-points/index.html'));
  });

  app.post("/getToken", (req, res) => {
    const headers = req.headers;
    const authHeader = headers["authorization"]

    generateJWT(authHeader)
      .then((token) => {
        res.status(200);
        res.send({token: token});
      })
      .catch((e) => {
        console.error("error generating JWT", e)

        res.status(401);
        res.send({error: e});
      })
  })

  app.post('/user', (req, res) => {
    tokenAuthMiddlware(req, res).then((_) => {
      createUser(req, res)
    })
  });

  app.post("/sessionDetails", (req, res) => {
    const sessionId = req.body["sessionId"];

    tokenAuthMiddlware(req, res)
      .then(_ => mysqlClient.getSessionNameFor(sessionId, (err, results) => {
        if (err || !results || results.length < 1) {
          res.status(500);
          res.send({error: "unable to retrieve session name"});
        } else {
          res.status(200);
          res.send(results[0]);
        }
      }))
  })

  app.post("/:sessionId/auth", (req, res) => {
    // rate limit
    const sessionId = req.params["sessionId"];
    const passcodeHash = req.body["passCode"];

    tokenAuthMiddlware(req, res).then((_) => {
      mysqlClient.verifySessionPassword(sessionId, (err, results) => {
        if (err) {
          res.status(500);
          res.send({error: "Something bad happened"});
        } else {
          const noSessionData = !results || results.length < 1;
          if (noSessionData) {
            res.status(401);
            res.send({error: "Invalid authorization for session"})
          } else {
            const row = results[0];
            const {id, passcode, passcode_enabled} = row;

            const validAuth = (id == sessionId && passcode === passcodeHash)

            if (!passcode_enabled || validAuth) {
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
  })
}

const tokenAuthMiddlware = (req, res) => {
  const headers = req.headers
  return validateAuth(headers).catch((error) => {
    res.status(401);
    res.send({error: "You shall not pass!"})
  });
}

const validateAuth = (headers) => {
  try {
    const authHeader = headers["authorization"]
    return validateIdToken(authHeader)
  } catch (e) {
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
