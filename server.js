const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const WebSocketServer = require("ws").Server;
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

  wss.on('error', (err) => {
    console.log('Error: ', err.message)
  })


  handleNewClients = (ws) => {
    _ws = ws;

    ws.on('message', handleIncomingMessages);
  };

  getStateOfTheAppForCaller = () => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get sessions', err.message);
      }
      notifyCaller(formatMessage('state-of-the-state', { sessions: results }))
    }

    mysqlClient.getAllSessions(getAllSessionsCallback)
  }

  getSessionState = (sessionId, notifier) => {
    mysqlClient.getSessionState(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get session state', err.message);
      }
      notifier(formatMessage('session-state', { sessionId: sessionId, participants: results }, sessionId));
    })
  }

  getStateOfTheAppForClients = () => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to terminate sessions', err.message);
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
    const { sessionId } = messageData.payload;

    mysqlClient.revealPointsForSession(sessionId, (err) => {
      if (err) {
        sendErrorToCaller('Unable to reveal points', err.message);
      } else {
        getSessionState(sessionId, notifyClients);
      }
    })
  };

  resetPoints = (messageData) => {
    const { sessionId } = messageData.payload;

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
    const { sessionId } = messageData.payload;

    mysqlClient.getSessionNameFor(sessionId, (err, sessionNameResults) => {
      if (err) {
        sendErrorToCaller('Unable to resolve session name', err.message);
      } else {
        const maybeSessionName = sessionNameResults && sessionNameResults.length > 0 ? sessionNameResults[0].sessionName : undefined;

        if (maybeSessionName) {
          notifyCaller(formatMessage(eventType, { sessionId: sessionId, sessionName: maybeSessionName }, sessionId));
        }
      }
    })
  }

  getSessionStateUsing = (messageData) => {
    const eventType = messageData.eventType;
    const { sessionId } = messageData.payload;

    mysqlClient.getSessionState(sessionId, (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to fetch session state', err.message);
      } else {
        notifyCaller(formatMessage(eventType, { sessionId: sessionId, participants: results }));
      }
    })
  };

  pointWasSubmitted = (messageData) => {
    const { userId, value, sessionId } = messageData.payload;

    const pointWasSubmittedCallback = (err) => {
      if (err) {
        sendErrorToCaller('Unable to submit point', err.message);
      } else {
        getSessionState(sessionId, notifyClients);
      }
    }

    mysqlClient.pointWasSubmitted(userId, value, pointWasSubmittedCallback);
  };

  addParticipantToSession = (messageData) => {
    const { sessionId, userName, isAdmin } = messageData.payload;

    const callback = (err) => {
      if (err) {
        sendErrorToCaller('Unable to add participant', err.message);
      }

      getSessionState(sessionId, notifyClients);

    }
    mysqlClient.addParticipantToSession(sessionId, userName, isAdmin, callback)

  };

  removeParticipantFromSession = (messageData) => {
    const { participantId, sessionId } = messageData.payload;

    mysqlClient.removeParticipantFromSession(participantId, sessionId, (err) => {
      if (err) {
        sendErrorToCaller('Unable to remove participant', err.message);
      } else {
        getSessionState(sessionId, notifyClients);
      }
    })
  };

  createNewSession = (messageData) => {
    const getAllSessionsCallback = (err, results) => {
      if (err) {
        sendErrorToCaller('Unable to get sessions', err.message);
      } else {
        notifyClients(formatMessage('state-of-the-state', { sessions: results }));
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
    notifyCaller(formatMessage('error', { message: message }))
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

const connectedToDB = (err) => {
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

