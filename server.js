const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const WebSocketServer = require("ws").Server;
const db = require('./db');
const mysqlClient = require('./mysqlClient')
const http = require('http');

let _ws;

const serveStaticUIContent = () => {
  console.log('Serving static content over server.');

  app.use(express.static(__dirname + '/dist/story-points'));

  app.get('/*', (_, res) => {
    res.sendFile(path.join(__dirname + '/dist/story-points/index.html'));
  });
}

const initHandlers = () => {
  console.log('Initializing server and setting up handlers.');

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors);

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server: server, path: "/socket" });

  handleNewClients = (ws) => {
    _ws = ws;

    getStateOfTheAppForCaller();

    ws.on('message', handleIncomingMessages);
  };

  getStateOfTheAppForCaller = () => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        // error ?
      }
      notifyCaller(formatMessage('state-of-the-state', { sessions: results }))
    }

    mysqlClient.getAllSessions(getAllSessionsCallback)
  }

  getSessionState = (sessionId, notifier) => {
    mysqlClient.getSessionState(sessionId, (err, participants) => {
      if (err) {
      }
      notifier(formatMessage('session-state', { sessionId: sessionId, participants: participants }, sessionId));
    })
  }

  getStateOfTheAppForClients = () => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        // error ?
      }
      notifyClients(formatMessage('state-of-the-state', { sessions: results }))
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
      }

      getStateOfTheAppForClients();
    }

    mysqlClient.terminateSession(requestedSession, callback);
  };

  revealPoints = (messageData) => {
    const eventType = messageData.eventType;
    const payload = messageData.payload;
    const requestedSession = payload.sessionName;
    const sessionData = state.sessions[requestedSession];
    notifyClients(formatMessage(eventType, sessionData, requestedSession))
  };

  resetPoints = (messageData) => {
    const eventType = messageData.eventType;
    // const requestedSession = messageData.payload.sessionName;


  };

  getSessionNameFor = (messageData) => {
    const eventType = messageData.eventType;
    const sessionId = messageData.payload.sessionId;

    mysqlClient.getSessionNameFor(sessionId, (err, sessionNameResults) => {
      if (err) {
      }

      const maybeSessionName = sessionNameResults && sessionNameResults.length > 0 ? sessionNameResults[0].sessionName : undefined;

      if (maybeSessionName) {
        notifyCaller(formatMessage(eventType, { sessionId: sessionId, sessionName: maybeSessionName }, sessionId));
      }
    })
  }

  getSessionStateUsing = (messageData) => {
    const eventType = messageData.eventType;
    const sessionId = messageData.payload.sessionId;

    mysqlClient.getSessionState(sessionId, (err, participants) => {
      if (err) {
      }
      notifyCaller(formatMessage(eventType, { sessionId: sessionId, participants: participants }));
    })

  };

  pointWasSubmitted = (messageData) => {
    // const eventType = messageData.eventType;

    const { userId, value, sessionId } = messageData.payload;

    const pointWasSubmittedCallback = (err) => {
      if (err) {
      }

      getSessionState(sessionId, notifyClients);
    }

    mysqlClient.pointWasSubmitted(userId, value, pointWasSubmittedCallback);
  };

  addParticipantToSession = (messageData) => {
    const eventType = messageData.eventType;
    const { sessionId, userName, isAdmin } = messageData.payload;

    const callback = (err, _) => {
      if (err) {
      }
      mysqlClient.getSessionState(sessionId, (err, participants) => {
        if (err) {
        }
        notifyClients(formatMessage(eventType, { sessionId: sessionId, participants: participants }, sessionId));
      })
    }
    mysqlClient.addParticipantToSession(sessionId, userName, isAdmin, callback)

  };

  removeParticipantFromSession = (messageData) => {
    const payload = messageData.payload;
    const { participantId, sessionId } = payload;

    mysqlClient.removeParticipantFromSession(participantId, sessionId, (err) => {
      if (err) {
      }
      getSessionState(sessionId, notifyClients);
    })
  };

  createNewSession = (messageData) => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        console.error(err.message);
        sendErrorToCaller(err.message);
      } else {
        notifyClients(formatMessage('state-of-the-state', { sessions: results }));
      }
    }

    const createSessionCallback = (err) => {
      if (err) {
        console.error(err.message);
        sendErrorToCaller(err.message);
      } else {
        mysqlClient.getAllSessions(getAllSessionsCallback)
      }
    }

    mysqlClient.createSession(messageData, createSessionCallback);
  };

  sendErrorToCaller = (message) => {
    notifyCaller(formatMessage('error', { reason: message }))
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
        if (client === _ws) {
          client.send(JSON.stringify(message));
        }
      });
  };

  wss.on('connection', handleNewClients);

  server.listen(process.env.PORT || 8081, () => {
    console.log(`Server (${server.address().address}) running on port ${server.address().port}`);
  });
}

const connectedToDB = (err, args) => {
  if (err) {
    throw Error(`Could not connect to DB: ${err.message}`);
  }


  serveStaticUIContent();
  initHandlers();
}

const startApp = () => {
  console.log('Connecting to DB...');
  mysqlClient.initDB(connectedToDB);
}

startApp();

