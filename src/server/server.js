const WebSocketServer = require("ws").Server;
const url = require('url');
const mysqlClient = require('./mysqlClient')

const startServer = () => {
  const server = require('http').createServer();
  const app = require('./http-server');

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  const wss = new WebSocketServer({server: server, path: '/socket'});

  server.on('request', app);
  wss.on('connection', handleNewClients);

  setInterval(() => {
    // keep connections alive by blasting them with messages every 30 seconds
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
        const {sessionId} = messageData.payload;
        getSessionState(sessionId);
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
      case 'celebrate':
        celebrate(messageData)
        break
    }
  };

  getSessionState = (sessionId, notifier, overrideEvent, extraProps) => {
    mysqlClient.getSessionData(sessionId)
      .then(sessionStateResults => {
        if (!sessionStateResults || sessionStateResults.length < 1) {
          return Promise.reject(`No session for id: "${sessionId}"`);
        }

        return Promise.all([
          mysqlClient.getSessionParticipants(sessionId),
          sessionStateResults
        ])
      })
      .then(res => {
        const [results, sessionStateResults] = res;
        notifyCaller(formatMessage(overrideEvent ? overrideEvent : 'session-state', {
            ...extraProps,
            sessionId: sessionId, sessionName: sessionStateResults[0].sessionName,
            participants: results, passcodeEnabled: sessionStateResults[0].passcodeEnabled
          }
        ));
      })
      .catch(e => {
        sendErrorToCaller('Unable to fetch session state', e.message)
      });
  }

  getStateOfTheAppForClients = () => {
    getAllSession()
  }

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

    mysqlClient.revealPointsForSession(sessionId)
      .then(results => {
        getSessionState(sessionId, notifyClients)
      })
      .catch(e => {
        console.error(`Unable to reveal points for session: ${sessionId}. Because: "${err}"`)
        sendErrorToCaller('Unable to reveal points', err.message);
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
    const {sessionId, userName, isAdmin, providerId, loginEmail} = messageData.payload;

    mysqlClient.addParticipantToSession(sessionId, userName, isAdmin, providerId, loginEmail)
      .then(results => {
        return getSessionState(sessionId, notifyClients, "participant-joined", {userName, providerId});
      })
      .then(_ => {
        getAllSession();
      })
      .catch(e => {
        console.error('Unable to add participant', e.message)
        sendErrorToCaller('Unable to add participant', e.message);
      })
  };

  removeParticipantFromSession = (messageData) => {
    const {participantId, userName, sessionId, providerId, loginEmail} = messageData.payload;

    mysqlClient.removeParticipantFromSession(participantId, sessionId)
      .then(results => {
        return getSessionState(sessionId, notifyClients, "participant-removed", {userName, providerId})
      })
      .then(_ => {
        getAllSession();
      })
      .catch(e => {
        console.error(`Unable to remove participant: "${participantId}" from session "${sessionId}" because: ${e.message}`)
        sendErrorToCaller('Unable to remove participant', e.message);
      });
  };

  celebrate = (messageData) => {
    const {celebration, celebrator, sessionId} = messageData.payload;

    mysqlClient.incrementCelebration(sessionId)
      .then(_ => {
        notifyClients(formatMessage("celebrate", {celebration, celebrator, sessionId}))
      }).catch(e => {
      console.error(`Could not increment celebration: "${e}"`)
    })
  }

  createNewSession = (messageData) => {
    mysqlClient.createSession(messageData)
      .then(results => {
        const sessionId = results["insertId"]

        return Promise.all([
          mysqlClient.setSessionAdmin(sessionId, messageData["payload"]["sessionData"]["createdBy"]),
          Promise.resolve(sessionId)
        ]);
      })
      .then(results => {
        const [_, sessionId] = results;
        return mysqlClient.writePassCode(sessionId, messageData)
      })
      .then(_ => {
        getAllSession()
      })
      .catch(e => {
        console.error(e);
        console.error(`Unable to create session with data: "${JSON.stringify(messageData || "{}")}" because: ${e.message}`);
        sendErrorToCaller('Unable to create session', e.message);
      })
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
    wss.clients
      .forEach(client => {
        const isTargeted = message.payload.sessionId !== undefined;

        if (isTargeted) { // can refactor to some targeting rules
          // message is targeted and client is connected to targeted session
          const clientIsTargeted = message.payload.sessionId == client.targetSessionId;
          if (clientIsTargeted) {
            client.send(JSON.stringify(message));
          }
        } else {
          if (!client.targetSessionId) {
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

