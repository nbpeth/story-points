const WebSocketServer = require("ws").Server;
const url = require('url');
const mysqlClient = require('./mysqlClient')

const startServer = () => {
  const server = require('http').createServer();
  const app = require('./http-server');
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  const wss = new WebSocketServer({server: server, path: '/socket'});

  server.on('request', app);
  wss.on('connection', handleNewClients);

  setInterval(() => {
    // keep connections alive
    console.log('clients', wss.clients.size);
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({}))
    });
  }, 30000);

  server.listen(process.env.PORT || 8080, () => {
    console.log(`listening on ${process.env.PORT || 8080}`);
  });

  return wss;
}

const setTargetSessionOn = (ws, request) => {
  const queryParams = url.parse(request.url, {parseQueryString: true}).query;
  ws["targetSessionId"] = queryParams.sessionId;
}

const handleNewClients = (ws, request) => {

  setTargetSessionOn(ws, request);

  ws.on('message', handleIncomingMessages);
};

const initHandlers = () => {
  const wss = startServer();

  getAllSession = () => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get sessions', err.message);
      }
      notifyCaller(formatMessage('state-of-the-state', {sessions: results}))
    }

    mysqlClient.getAllSessions(getAllSessionsCallback)
  }

  getStateOfTheAppForCaller = () => {
    getAllSession()
  }

  getSessionState = (sessionId, notifier) => {
    mysqlClient.getSessionParticipants(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get session state', err.message);
      }
      notifier(formatMessage('session-state', {sessionId: sessionId, participants: results}, sessionId));
    })
  }

  getSessionStateForParticipantJoined = (sessionId, userName, loginId, loginEmail, notifier) => {
    mysqlClient.getSessionParticipants(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get session state', err.message);
      }

      console.log("res", results)

      notifier(formatMessage('participant-joined', {
        sessionId: sessionId,
        userName: userName,
        loginId: loginId,
        loginEmail: loginEmail,
        participants: results
      }, sessionId));
    })
  }

  getSessionStateForParticipantRemoved = (sessionId, userName, loginId, loginEmail, notifier) => {
    mysqlClient.getSessionData(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get session state', err.message);
      }
      notifier(formatMessage('participant-removed', {
        sessionId: sessionId,
        userName: userName,
        loginId: loginId,
        loginEmail: loginEmail,
        participants: results
      }, sessionId));
    })
  }

  getStateOfTheAppForClients = () => {
    getAllSession()
  }

  handleIncomingMessages = (message) => {
    const messageData = JSON.parse(message);
    const eventType = messageData.eventType;
    console.log('incoming!', messageData)
    switch (eventType) {
      case 'state-of-the-state':
        getStateOfTheAppForCaller();
        break;
      case 'session-created':
        createNewSession(messageData);
        break;
      case 'session-state':
        getSessionStateUsing(messageData);
        break;
      case 'participant-joined':
        addParticipantToSession(messageData);
        break;
      case 'participant-removed':
        removeParticipantFromSession(messageData);
        break;
      case 'point-submitted':
        pointWasSubmitted(messageData);
        break;
      case 'points-reset':
        resetPoints(messageData);
        break;
      case 'points-revealed':
        revealPoints(messageData);
        break;
      case 'terminate-session':
        terminateSession(messageData);
        break;
      // case 'get-session-name':
      //   getSessionNameFor(messageData);
      //   break;
      case 'celebrate':
        celebrate(messageData)
        break
      // case 'create-user':
      //   createUser(messageData)
      //   break;
    }
  };

  terminateSession = (messageData) => {
    const payload = messageData.payload;
    const requestedSession = payload.sessionId;

    const callback = (err) => {
      if (err) {
        sendErrorToCaller('Unable to terminate sessions', err.message);
      } else {
        getStateOfTheAppForClients();
      }
    }

    mysqlClient.terminateSession(requestedSession, callback);
  };

  revealPoints = (messageData) => {
    const {sessionId} = messageData.payload;

    mysqlClient.revealPointsForSession(sessionId, (err) => {
      if (err) {
        console.error(err)
        sendErrorToCaller('Unable to reveal points', err.message);
      } else {
        getSessionState(sessionId, notifyClients);
      }
    })
  };

  resetPoints = (messageData) => {
    const {sessionId} = messageData.payload;

    mysqlClient.resetPointsForSession(sessionId, (err) => {
      if (err) {
        sendErrorToCaller('Unable to reset points', err.message);
      } else {
        getSessionState(sessionId, notifyClients);
      }
    })
  };

  getSessionStateUsing = (messageData) => {
    const eventType = messageData.eventType;
    const {sessionId} = messageData.payload;

    mysqlClient.getSessionData(sessionId, (err, sessionStateResults) => {
      if (err || !sessionStateResults || sessionStateResults.length < 1) {
        sendErrorToCaller('Unable to fetch session state', err.message);
      } else {
        mysqlClient.getSessionParticipants(sessionId, (err, results) => {
          if (err) {
            sendErrorToCaller('Unable to fetch session participants', err.message);
          } else {
            notifyCaller(formatMessage(eventType, {sessionId: sessionId, sessionName:sessionStateResults[0].sessionName, participants: results, passcodeEnabled: sessionStateResults[0].passcodeEnabled}));
          }
        })
      }
    })
  };

  pointWasSubmitted = (messageData) => {
    const {userId, value, sessionId, hasAlreadyVoted} = messageData.payload;

    const pointWasSubmittedCallback = (err) => {
      if (err) {
        sendErrorToCaller('Unable to submit point', err.message);
      } else {
        getSessionState(sessionId, notifyClients);
      }
    }

    mysqlClient.pointWasSubmitted(userId, value, hasAlreadyVoted, pointWasSubmittedCallback);
  };

  addParticipantToSession = (messageData) => {
    const {sessionId, userName, isAdmin, loginId, loginEmail} = messageData.payload;

    const callback = (err) => {
      if (err) {
        sendErrorToCaller('Unable to add participant', err.message);
      }

      getSessionStateForParticipantJoined(sessionId, userName, loginId, loginEmail, notifyClients);
      getAllSession();

    }
    mysqlClient.addParticipantToSession(sessionId, userName, isAdmin, loginId, loginEmail, callback)
  };

  removeParticipantFromSession = (messageData) => {
    const {participantId, userName, sessionId, loginId, loginEmail} = messageData.payload;

    mysqlClient.removeParticipantFromSession(participantId, sessionId, (err) => {
      if (err) {
        sendErrorToCaller('Unable to remove participant', err.message);
      } else {
        getSessionStateForParticipantRemoved(sessionId, userName, loginId, loginEmail, notifyClients);
      }

      getAllSession();
    })
  };

  celebrate = (messageData) => {
    const { celebration, celebrator, sessionId } = messageData.payload;

    mysqlClient.incrementCelebration(sessionId);

    notifyClients(formatMessage("celebrate", {celebration, celebrator, sessionId}))
  }

  createNewSession = (messageData) => {
    const createSessionCallback = (err, results, fields) => {
      if (err) {
        sendErrorToCaller('Unable to create session', err.message);
      } else {
        mysqlClient.writePassCode(results["insertId"], messageData, (err) => {
          // if (err) {
          //   sendErrorToCaller('Unable to create session', err.message);
          // } else {
          console.log("we did it!")
            getAllSession()
          // }
        })
      }
    }
    mysqlClient.createSession(messageData, createSessionCallback);
  };

  sendErrorToCaller = (message, reason) => {
    // console.error(`${message}: ${reason}`);
    notifyCaller(formatMessage('error', {message: message}))
  }

  formatMessage = (eventType, payload, targetSession) => ({
    eventType: eventType,
    payload: payload,
    targetSession: targetSession,
  });

  notifyClients = (message) => {
    notifyCaller(message);
  };

  notifyCaller = (message) => {
    console.log('outgoing!!!', message)
    wss.clients
      .forEach(client => {
        const isTargeted = message.payload.sessionId !== undefined;

        if(isTargeted) { // can refactor to some targeting rules
          // message is targeted and client is connected to targeted session
          const clientIsTargeted = +message.payload.sessionId === +client.targetSessionId;
          if(clientIsTargeted) {
            client.send(JSON.stringify(message));
          }
        } else {
          if(!client.targetSessionId) {
            client.send(JSON.stringify(message));
          }
        }
      });
  };
}

const connectedToDB = (err) => {
  if (err) {
    throw Error(`Could not connect to DB: ${err.message}`);
  }

  initHandlers();
}

const startApp = () => {
  console.log('Connecting to DB...');
  mysqlClient.initDB(connectedToDB);
}

startApp();

