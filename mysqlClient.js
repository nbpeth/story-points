const mysql = require('mysql');
let pool;

initDB = (onComplete) => {
  pool = mysql.createPool({
    host: process.env.SPHOST,
    user: process.env.SPUSER,
    password: process.env.SPPASSWORD,
    canRetry: true,
  });

  pool.on('error', (err) => {
    console.log('error pool.on', err);
  });

  onComplete();
}


runQuery = (statement, onComplete) => {
  pool.getConnection((err, con) => {
    if (err) {
      console.log('error getConnection to db', err);
    }

    con.query(statement, (err, results, fields) => {
      onComplete(err, results, fields);

      con.release();
    });

  })
}

getAllSessions = (onComplete) => {
  const sql = 'SELECT id, session_name as sessionName FROM storypoints.sessions';
  const statement = mysql.format(sql, []);

  runQuery(statement, onComplete)
}

createSession = (messageData, onComplete) => {
  const payload = messageData.payload;
  const sessionName = payload && payload.sessionName ? payload.sessionName : undefined;

  if (!sessionName) {
    // error!
  }

  const sql = 'INSERT INTO storypoints.sessions (session_name) VALUES (?)';
  const statement = mysql.format(sql, [sessionName]);

  runQuery(statement, onComplete);
}

terminateSession = (sessionId, onComplete) => {
  const sql = 'DELETE FROM storypoints.sessions WHERE id = (?)';
  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

getSessionState = (sessionId, onComplete) => {
  const sql = `
        SELECT s.id,
        s.points_visible as pointsVisible,
        s.session_name as sessionName,
        p.participant_name as participantName,
        p.id as participantId,
        p.point,
        p.is_admin as isAdmin,
        p.has_voted as hasVoted
        FROM storypoints.sessions s, storypoints.participant p
        WHERE s.id = ?
        AND s.id = p.session_id;
    `;

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

getSessionNameFor = (sessionId, onComplete) => {
  const sql = `
        SELECT s.session_name as sessionName FROM storypoints.sessions s WHERE s.id = ?
    `;

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

addParticipantToSession = (sessionId, userName, isAdmin, onComplete) => {
  const sql = `
        INSERT INTO storypoints.participant (session_id, participant_name, point, is_admin)
        VALUES
        (?, ?, ?, ?);
    `;

  const statement = mysql.format(sql, [sessionId, userName, 0, isAdmin]);

  runQuery(statement, onComplete);
}

removeParticipantFromSession = (participantId, sessionId, onComplete) => {
  const sql = `
        DELETE FROM storypoints.participant WHERE id = ? AND session_id = ?
    `;

  const statement = mysql.format(sql, [participantId, sessionId]);

  runQuery(statement, onComplete);
}

pointWasSubmitted = (participantId, value, onComplete) => {
  const sql = `
        UPDATE storypoints.participant SET point = ?, has_voted = true WHERE id = ?
    `

  const statement = mysql.format(sql, [value, participantId]);

  runQuery(statement, onComplete);
}

resetPointsForSession = (sessionId, onComplete) => {
  const sql = `
        UPDATE storypoints.participant p, storypoints.sessions s
        SET p.point = 0, p.has_voted = false, s.points_visible = false
        WHERE p.session_id = ?
        AND s.id = ?
    `

  const statement = mysql.format(sql, [sessionId, sessionId]);

  runQuery(statement, onComplete);
}

revealPointsForSession = (sessionId, onComplete) => {
  const sql = `
        UPDATE storypoints.sessions SET points_visible = true WHERE id = ?
    `

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

module.exports = {
  initDB: initDB,
  getAllSessions: getAllSessions,
  createSession: createSession,
  terminateSession: terminateSession,
  getSessionState: getSessionState,
  getSessionNameFor: getSessionNameFor,
  addParticipantToSession: addParticipantToSession,
  removeParticipantFromSession: removeParticipantFromSession,
  pointWasSubmitted: pointWasSubmitted,
  resetPointsForSession: resetPointsForSession,
  revealPointsForSession: revealPointsForSession,
}
