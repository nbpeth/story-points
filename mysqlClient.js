// const e = require('cors');
const mysql = require('mysql');
let pool;

const initDB = (onComplete) => {
  console.log("Init DB");

  if (Boolean(pool)) {
    console.warn("Pool already created, skipping");

  } else {
    console.warn("Initiating connection pool")
    const [host, db] = process.env.SPHOST ? process.env.SPHOST.split("/") : ["", ""]
    pool = mysql.createPool({
      // connectionLimit: 10,
      database: db,
      host,
      password: process.env.SPPASSWORD,
      user: process.env.SPUSER,
    });
  }
  pool.on('error', (err) => {
    console.log('error pool.on', err);
  });

  onComplete();
}


const runQuery = (statement, onComplete, retry = 0) => {

  pool.getConnection((err, con) => {
    if(retry >= 3) {
      throw Error("Could not get connection");
    }

    if (err) {
      console.error('Error getConnection to db', err, `Retry ${retry} of 3`);
      // try to recover connection: max 3 retries

      setTimeout(() => {
        runQuery(statement, onComplete, retry + 1);
      }, 1000);

    } else {
      con.query(statement, (err, results, fields) => {
        onComplete && onComplete(err, results, fields);

        con.release();
      });
    }
  });
}

getAllSessions = (onComplete) => {
  const sql = `select a.id as id, a.id, a.sessionName as sessionName, lastActive, participantCount from
    (select s.id, s.session_name as sessionName from sessions s) as a
    left join (select
        s.id,
        s.session_name as sessionName,
        s.last_active as lastActive,
        count(p.id) as participantCount
        from sessions s, participant p
        where s.id = p.session_id
        group by s.session_name) as b
    on a.id = b.id`

  const statement = mysql.format(sql, []);

  runQuery(statement, onComplete)
}

createSession = (messageData, onComplete) => {
  const payload = messageData.payload;
  const sessionName = payload && payload.sessionName ? payload.sessionName : undefined;

  if (!sessionName) {
    // error!
  }

  const sql = 'INSERT INTO sessions (session_name) VALUES (?)';
  const statement = mysql.format(sql, [sessionName]);

  runQuery(statement, onComplete);
}

terminateSession = (sessionId, onComplete) => {
  const sql = 'DELETE FROM sessions WHERE id = (?)';
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
        p.has_voted as hasVoted,
        p.has_revoted as hasAlreadyVoted,
        p.login_id as loginId,
        p.login_email as loginEmail,
        u.photo_url as photoUrl,
        u.first_name as firstName,
        u.last_name as lastName
        FROM sessions s, participant p, user u
        WHERE s.id = ?
        AND s.id = p.session_id
        AND p.login_id = u.provider_id;
    `;

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

getSessionNameFor = (sessionId, onComplete) => {
  const sql = `
        SELECT s.session_name as sessionName FROM sessions s WHERE s.id = ?
    `;

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

addParticipantToSession = (sessionId, userName, isAdmin, loginId, loginEmail, onComplete) => {
  const sql = `
        INSERT INTO participant (session_id, participant_name, point, is_admin, login_id, login_email)
        VALUES
        (?, ?, ?, ?, ?, ?);
    `;

  const statement = mysql.format(sql, [sessionId, userName, 0, isAdmin, loginId, loginEmail]);

  runQuery(statement, onComplete);
}

removeParticipantFromSession = (participantId, sessionId, onComplete) => {
  const sql = `
        DELETE FROM participant WHERE id = ? AND session_id = ?
    `;

  const statement = mysql.format(sql, [participantId, sessionId]);

  runQuery(statement, onComplete);
}

pointWasSubmitted = (participantId, value, hasAlreadyVoted, onComplete) => {
  const sql = `
        UPDATE participant SET point = ?, has_voted = true, has_revoted = ? WHERE id = ?
    `

  const statement = mysql.format(sql, [value, hasAlreadyVoted, participantId]);

  runQuery(statement, onComplete);
}

resetPointsForSession = (sessionId, onComplete) => {
  const sql = `
        UPDATE participant p, sessions s
        SET p.point = 0, p.has_voted = false, s.points_visible = false, p.has_revoted = false
        WHERE p.session_id = ?
        AND s.id = ?
    `

  const statement = mysql.format(sql, [sessionId, sessionId]);

  runQuery(statement, onComplete);
}

revealPointsForSession = (sessionId, onComplete) => {
  const sql = `UPDATE sessions SET points_visible = true, last_active = ? WHERE id = ?`

  const statement = mysql.format(sql, [new Date(), sessionId]);

  runQuery(statement, onComplete);
}

createUser = (user, onComplete) => {
  const { firstName, lastName, id, name, photoUrl, provider } = user;
  if(!id || !provider) {
    console.error(`No ID or Provider, unable to write user. ID: '${id}', Provider: '${provider}'`)
    onComplete("Missing user id or provider id");
  } else {
    const sql = `
        INSERT INTO USER
        (first_name, last_name, provider_id, name, photo_url, provider, date_joined, updated)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        first_name = ?, last_name = ?, name = ?, photo_url = ?, provider = ?, updated = ?
    `
    const now = new Date();
    const statement = mysql.format(sql, [firstName, lastName, id, name, photoUrl, provider, now, now, firstName, lastName, name, photoUrl, provider, now]);

    runQuery(statement, onComplete);
  }
}

incrementCelebration = (sessionId) => {
  const sql = `
    INSERT INTO CELEBRATION
    (session_id, count)
    VALUES
    (?, ?)
    ON DUPLICATE KEY UPDATE count = count + 1;
  `

  const statement = mysql.format(sql, [sessionId, 1]);

  runQuery(statement);
}

module.exports = {
  initDB,
  getAllSessions,
  createSession,
  terminateSession,
  getSessionState,
  getSessionNameFor,
  addParticipantToSession,
  removeParticipantFromSession,
  pointWasSubmitted,
  resetPointsForSession,
  revealPointsForSession,
  createUser,
  incrementCelebration,
}
