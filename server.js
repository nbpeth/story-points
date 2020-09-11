
const WebSocketServer = require("ws").Server;
const mysqlClient = require('./mysqlClient')

const startServer = () => {
  const server = require('http').createServer();
  const app = require('./http-server');
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

const handleNewClients = (ws) => {
  ws.on('message', handleIncomingMessages);
};

const initHandlers = () => {
  const wss = startServer();

  getStateOfTheAppForCaller = () => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get sessions', err.message);
      }
      notifyCaller(formatMessage('state-of-the-state', {sessions: results}))
    }

    mysqlClient.getAllSessions(getAllSessionsCallback)
  }

  getSessionState = (sessionId, notifier) => {
    mysqlClient.getSessionState(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get session state', err.message);
      }
      notifier(formatMessage('session-state', {sessionId: sessionId, participants: results}, sessionId));
    })
  }

  getSessionStateForParticipantJoined = (sessionId, userName, notifier) => {
    mysqlClient.getSessionState(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get session state', err.message);
      }
      notifier(formatMessage('participant-joined', {sessionId: sessionId, userName: userName, participants: results}, sessionId));
    })
  }

  getSessionStateForParticipantRemoved = (sessionId, userName, notifier) => {
    mysqlClient.getSessionState(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get session state', err.message);
      }
      notifier(formatMessage('participant-removed', {sessionId: sessionId, userName: userName, participants: results}, sessionId));
    })
  }

  getStateOfTheAppForClients = () => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to terminate sessions', err.message);
      }
      notifyClients(formatMessage('state-of-the-state', {sessions: results}))
    }

    mysqlClient.getAllSessions(getAllSessionsCallback)
  }

  handleIncomingMessages = (message) => {
    const messageData = JSON.parse(message);
    const eventType = messageData.eventType;

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
      case 'get-session-name':
        getSessionNameFor(messageData);
        break;
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

  getSessionNameFor = (messageData) => {
    const eventType = messageData.eventType;
    const {sessionId} = messageData.payload;

    mysqlClient.getSessionNameFor(sessionId, (err, sessionNameResults) => {
      if (err) {
        sendErrorToCaller('Unable to resolve session name', err.message);
      } else {
        const maybeSessionName = sessionNameResults && sessionNameResults.length > 0 ? sessionNameResults[0].sessionName : undefined;

        if (maybeSessionName) {
          notifyCaller(formatMessage(eventType, {sessionId: sessionId, sessionName: maybeSessionName}, sessionId));
        }
      }
    })
  }

  getSessionStateUsing = (messageData) => {
    const eventType = messageData.eventType;
    const {sessionId} = messageData.payload;

    mysqlClient.getSessionState(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to fetch session state', err.message);
      } else {
        notifyCaller(formatMessage(eventType, {sessionId: sessionId, participants: results}));
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
    const {sessionId, userName, isAdmin} = messageData.payload;

    const callback = (err) => {
      if (err) {
        sendErrorToCaller('Unable to add participant', err.message);
      }

      getSessionStateForParticipantJoined(sessionId, userName, notifyClients);

    }
    mysqlClient.addParticipantToSession(sessionId, userName, isAdmin, callback)
  };

  removeParticipantFromSession = (messageData) => {
    const {participantId, userName, sessionId} = messageData.payload;

    mysqlClient.removeParticipantFromSession(participantId, sessionId, (err) => {
      if (err) {
        sendErrorToCaller('Unable to remove participant', err.message);
      } else {
        getSessionStateForParticipantRemoved(sessionId, userName, notifyClients);
      }
    })
  };

  createNewSession = (messageData) => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get sessions', err.message);
      } else {
        notifyClients(formatMessage('state-of-the-state', {sessions: results}));
      }
    }

    const createSessionCallback = (err) => {
      if (err) {
        sendErrorToCaller('Unable to create session', err.message);
      } else {
        mysqlClient.getAllSessions(getAllSessionsCallback)
      }
    }

    mysqlClient.createSession(messageData, createSessionCallback);
  };

  sendErrorToCaller = (message, reason) => {
    console.error(`${message}: ${reason}`);
    notifyCaller(formatMessage('error', {message: message}))
  }

  formatMessage = (eventType, payload, targetSession) => ({
    eventType: eventType,
    payload: payload,
    targetSession: targetSession,
  });

  notifyClients = (message) => {
    wss.clients
      .forEach(client => {
        client.send(JSON.stringify(message));
      });
  };

  notifyCaller = (message) => {
    wss.clients
      .forEach(client => {
        // if (client === _ws) {
          client.send(JSON.stringify(message));
        // }
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

