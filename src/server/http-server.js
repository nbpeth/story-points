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

  app.use(express.static(__dirname + '../../../dist/story-points'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(cors());

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname + '../../../dist/story-points/index.html'));
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

  app.post('/user/details', (req, res) => {
    tokenAuthMiddlware(req, res).then((userInfo) => {
        mysqlClient.getUserAdminSessions(userInfo.sub)
          .then((rooms) => {
              const adminOfRooms = rooms.map(results => {
                return results ? results["session_id"] : undefined;
              });

              res.status(200);
              res.send({...userInfo, adminOfRooms})
            }
          ).catch(e => {
          res.status(500)
          console.error(e)
          res.send(`An error occurred: ${e.message}`)
        })
      }
    ).catch(e => {
      res.status(500)
      console.error(e)
      res.send(`An error occurred: ${e.message}`)
    })
  });

  app.post("/changePasscode", (req, res) => {
    tokenAuthMiddlware(req, res).then(userInfo => {
      const sessionId = req.body["sessionId"]
      const newPasscode = req.body["newPasscode"]

      mysqlClient.getUserAdminSessions(userInfo.sub)
        .then((rooms) => {
          const adminOfRooms = rooms.map(results => {
            return results ? results["session_id"] : undefined;
          });

          if (!adminOfRooms || adminOfRooms.length < 1 || !adminOfRooms.includes(+sessionId)) {
            throw Error("User is not admin of this room and cannot change the passcode");
          }

          return mysqlClient.changeSessionPasscode(sessionId, newPasscode)
        })
        .then((_) => {
          console.log(`Passcode changed for session: ${sessionId}`)
          res.status(204);
          res.send();

        })
        .catch((e) => {
          console.error(e);
          res.status(401);
          res.send("Yea, you aren't allowed to do that.")
        })
    })
  })

  app.post("/sessionDetails", (req, res) => {
    const sessionId = req.body["sessionId"];

    tokenAuthMiddlware(req, res)
      .then(_ =>
        mysqlClient.getSessionNameFor(sessionId)
          .then((results) => {
              if (!results || results.length < 1) {
                res.status(500);
                res.send({error: "unable to retrieve session name"});
              } else {
                res.status(200);
                res.send(results[0]);
              }
            }
          ).catch((e) => {
            console.error(e);
            res.status(500);
            res.send({error: "unable to retrieve session name"});
          }
        )
      )
  })

  app.post("/:sessionId/auth", (req, res) => {
    // rate limit
    const sessionId = req.params["sessionId"];
    const passcodeHash = req.body["passCode"];

    tokenAuthMiddlware(req, res)
      .then((_) => {
        return mysqlClient.verifySessionPassword(sessionId)
      })
      .then(results => {
        const noSessionData = !results || results.length < 1;
        if (noSessionData) {
          return Promise.reject(`Invalid authorization for session: no session: "${sessionId}"`);
        }
        const row = results[0];
        const {id, passcode, passcode_enabled} = row;

        const validAuth = (id == sessionId && passcode === passcodeHash)

        if (!passcode_enabled || validAuth) {
          res.status(200);
          res.send({ok: "yay"})
        } else {
          return Promise.reject(`Invalid authorization for session: incorrect password: "${sessionId}"`);
        }
      })
      .catch(e => {
        console.error(`Error validating password for session: ${e}`)
        res.status(401);
        res.send("Unauthorized")
      })
  });
}

const tokenAuthMiddlware = (req, res) => {
  const headers = req.headers
  return validateAuth(headers)
    .catch((error) => {
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

// this user is used to store metadata sourced from the auth provider about a user that is distributed to other members of a session; e.g. photo url, name
const createUser = (req, res) => {
  mysqlClient.createUser(req.body)
    .then(_ => {
      res.status(200);
      res.send(req.body);
    })
    .catch(e => {
      console.error(`Could not create user: "${e}"`)
      res.status(500);
      res.send({error: err})
    });
}

mysqlClient.initDB(startServer)

module.exports = app;
