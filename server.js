const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const WebSocketServer = require("ws").Server;
const db = require('./db');
const http = require('http');

let _ws;
const state = {
  sessions: {},
};

const initHandlers = () => {
  /*
  serve static UI content
 */
  app.use(express.static(__dirname + '/dist/story-points'));

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/story-points/index.html'));
  });

  /*
    web socket server
   */

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors);

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server: server, path: "/socket" });

  handleNewClients = (ws) => {
    _ws = ws;

    db.getAllSessions().then((sessions) => {
      const message = formatMessage('state-of-the-state', sessions);

      notifyCaller(message);

      ws.on('message', handleIncomingMessages);
    })

  };

  handleIncomingMessages = (message) => {
    const messageData = JSON.parse(message);
    const eventType = messageData.eventType;

    switch (eventType) {
      case 'state-of-the-state':
        db.getAllSessions().then((sessions) => {
          notifyCaller(formatMessage('state-of-the-state', sessions));
        });

        break;
      case 'session-created':
        createNewSession(messageData);
        break;
      case 'session-state':
        getSessionState(messageData);
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
    }
  };

  terminateSession = (messageData) => {
    const payload = messageData.payload;
    const requestedSession = payload.sessionName;

    db.terminateSession(requestedSession).then((sessions) => {
      const message = formatMessage('state-of-the-state', sessions);

      notifyClients(message);
    })
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
    const requestedSession = messageData.payload.sessionName;

    db.resetPoints(requestedSession).then((stateForSession) => {
      notifyClients(formatMessage(eventType, stateForSession, requestedSession))
    })
  };

  getSessionState = (messageData) => {
    const eventType = messageData.eventType;
    const requestedSession = messageData.payload.sessionName;

    db.getStateForSession(requestedSession).then((stateForSession) => {
      notifyCaller(formatMessage(eventType, stateForSession, requestedSession));
    })
  };

  pointWasSubmitted = (messageData) => {
    const payload = messageData.payload;
    const requestedSession = payload.sessionName;
    const targetUser = payload.userName;
    const point = payload.value

    db.pointWasSubmitted(requestedSession, targetUser, point).then((sessionData) => {
      notifyClients(formatMessage(messageData.eventType, sessionData, requestedSession))
    })
  };

  addParticipantToSession = (messageData) => {
    const payload = messageData.payload;
    const requestedSession = payload.sessionName;
    const participantToAdd = payload.userName;
    const isAdmin = payload.isAdmin;

    db.addParticipantToSession(requestedSession, participantToAdd, isAdmin).then((stateForSession) => {
      notifyClients(formatMessage(messageData.eventType, stateForSession, requestedSession))
    });
  };

  removeParticipantFromSession = (messageData) => {
    const payload = messageData.payload;
    const requestedSession = payload.sessionName;
    const participantToRemove = payload.userName;

    db.removeParticipantFromSession(requestedSession, participantToRemove).then((stateForSession) => {
      notifyClients(formatMessage(messageData.eventType, stateForSession, requestedSession))
    })
  };

  createNewSession = (messageData) => {
    db.createSession(messageData).then((sessions) => {
      const message = formatMessage('state-of-the-state', sessions);
      notifyClients(message)
    })
  };

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

db.connect()
  .finally(() => {
    initHandlers();
  });