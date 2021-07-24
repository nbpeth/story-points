const mysql = require('mysql');
let pool;

initDB = (onComplete) => {
  pool = mysql.createPool(process.env.SPMYSQL_URL)

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
      onComplete && onComplete(err, results, fields);

      con.release();
    });
  })
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
        p.login_email as loginEmail,
        u.photo_url as photoUrl,
        u.first_name as firstName,
        u.last_name as lastName
        FROM sessions s, participant p, user u
        WHERE s.id = ?
        AND s.id = p.session_id
        AND p.login_email = u.email;
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

addParticipantToSession = (sessionId, userName, isAdmin, loginEmail, onComplete) => {
  const sql = `
        INSERT INTO participant (session_id, participant_name, point, is_admin, login_email)
        VALUES
        (?, ?, ?, ?, ?);
    `;

  const statement = mysql.format(sql, [sessionId, userName, 0, isAdmin, loginEmail]);

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
  const { given_name, family_name, email, name, picture, sub } = user;
  console.log("user...", user)
  if(!email || !sub) {
    console.error(`No ID or Provider, unable to write user. ID: '${id}', Provider: '${provider}'`)
    onComplete("Missing user id or provider id");
  } else {

    // find a way to migrate existing users until they're all moved over

    const sql = `
        INSERT INTO USER
        (first_name, last_name, provider_id, name, photo_url, provider, date_joined, updated, email)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        first_name = ?, last_name = ?, name = ?, photo_url = ?, provider = ?, updated = ?, email = ?
    `
    const now = new Date();
    const statement = mysql.format(sql, [given_name, family_name, email, name, picture, sub, now, now, email, given_name, family_name, name, picture, sub, now, email]);

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
