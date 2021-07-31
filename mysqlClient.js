const mysql = require('mysql');
let pool;

// can refactor everything to use promises now!

initDB = (onComplete) => {
  pool = mysql.createPool(process.env.SPMYSQL_URL)

  pool.on('error', (err) => {
    console.log('error pool.on', err);
  });

  onComplete();
}

runQueryPromise = (statement) => {
  return new Promise((resolve, reject) => {

    pool.getConnection((err, con) => {
      if (err) {
        console.log('error getConnection to db', err);
      }

      con.query(statement, (err, results) => {
        if (err) {
          reject({err})
        } else {
          resolve(results)
        }
        con.release();
      });
    });
  });
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

getUserAdminSessions = (providerId) => {
  const sql = `
    select *
    from session_admin a
    where provider_id = ?;
  `;

  const statement = mysql.format(sql, [providerId]);

  return runQueryPromise(statement);
}

getAllSessions = (onComplete) => {
  const sql = `select a.id as id, a.id, a.sessionName, a.passcodeEnabled, lastActive, participantCount
               from (select s.id, s.session_name as sessionName, s.passcode_enabled as passcodeEnabled
                     from sessions s) as a
                      left join (select s.id,
                                        s.session_name     as sessionName,
                                        s.last_active      as lastActive,
                                        s.passcode_enabled as x,
                                        count(p.id)        as participantCount
                                 from sessions s,
                                      participant p
                                 where s.id = p.session_id
                                 group by s.session_name) as b
                                on a.id = b.id`

  const statement = mysql.format(sql, []);

  runQuery(statement, onComplete)
}

createSession = (messageData, onComplete) => {
  const payload = messageData.payload;

  const {createWithPasscode, name} = payload && payload.sessionData || {};

  if (!name) {
    throw Error("no session name")
  }

  const sql = 'INSERT INTO sessions (session_name, passcode_enabled) VALUES (?, ?)';
  const statement = mysql.format(sql, [name, createWithPasscode]);

  runQuery(statement, onComplete);
}

setSessionAdmin = (sessionId, providerId) => {
  const sql = 'INSERT INTO session_admin (session_id, provider_id) VALUES (?, ?)';
  const statement = mysql.format(sql, [sessionId, providerId]);

  runQuery(statement, (err) => {
    if (err) {
      console.error(`Unable to set session admin: '${providerId}' for session '${sessionId}'`)
    }
  });
}

writePassCode = (sessionId, messageData, onComplete) => {
  const payload = messageData.payload;
  const {passCode} = payload && payload.sessionData || {};

  const sql = 'INSERT INTO session_passcode (session_id, passcode) VALUES (?, ?)';
  const statement = mysql.format(sql, [sessionId, passCode]);

  runQuery(statement, onComplete);
}

terminateSession = (sessionId, onComplete) => {
  const sql = 'DELETE FROM sessions WHERE id = (?)';
  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

getSessionParticipants = (sessionId, onComplete) => {
  const sql = `
    SELECT s.id,
           s.points_visible   as pointsVisible,
           s.session_name     as sessionName,
           s.passcode_enabled as passcodeEnabled,
           p.participant_name as participantName,
           p.id               as participantId,
           p.point,
           p.is_admin         as isAdmin,
           p.has_voted        as hasVoted,
           p.has_revoted      as hasAlreadyVoted,
           p.provider_id      as providerId,
           p.login_email      as loginEmail,
           u.photo_url        as photoUrl,
           u.first_name       as firstName,
           u.last_name        as lastName
    FROM sessions s,
         participant p,
         user u
    WHERE s.id = ?
      AND s.id = p.session_id
      AND p.provider_id = u.provider_id;
  `;

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}


getSessionState = (sessionId, onComplete) => {
  const sql = `
    SELECT s.id,
           s.points_visible   as pointsVisible,
           s.session_name     as sessionName,
           s.passcode_enabled as passcodeEnabled,
           p.participant_name as participantName,
           p.id               as participantId,
           p.point,
           p.is_admin         as isAdmin,
           p.has_voted        as hasVoted,
           p.has_revoted      as hasAlreadyVoted,
           p.login_email      as loginEmail,
           p.provider_id      as providerId,
           u.photo_url        as photoUrl,
           u.first_name       as firstName,
           u.last_name        as lastName
    FROM sessions s,
         participant p,
         user u
    WHERE s.id = ?
      AND s.id = p.session_id
      AND p.provider_id = u.provider_id;
  `;

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

getSessionDetails = (sessionId, onComplete) => {
  const sql = `
    SELECT s.session_name as sessionName, s.id
    FROM sessions s
    WHERE s.id = ?
  `;

  const statement = mysql.format(sql, [sessionId]);

  return runQueryPromise(statement, onComplete);
}

getSessionData = (sessionId, onComplete) => {
  const sql = `
    SELECT s.session_name     as sessionName,
           s.passcode_enabled as passcodeEnabled
    FROM sessions s
    WHERE s.id = ?
  `;

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}


addParticipantToSession = (sessionId, userName, isAdmin, providerId, loginEmail, onComplete) => {
  const sql = `
    INSERT INTO participant (session_id, participant_name, provider_id, point, is_admin, login_email)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  const statement = mysql.format(sql, [sessionId, userName, providerId, 0, isAdmin, loginEmail]);

  runQuery(statement, onComplete);
}

removeParticipantFromSession = (participantId, sessionId, onComplete) => {
  const sql = `
    DELETE
    FROM participant
    WHERE id = ?
      AND session_id = ?
  `;

  const statement = mysql.format(sql, [participantId, sessionId]);

  runQuery(statement, onComplete);
}

pointWasSubmitted = (participantId, value, hasAlreadyVoted, onComplete) => {
  const sql = `
    UPDATE participant
    SET point       = ?,
        has_voted   = true,
        has_revoted = ?
    WHERE id = ?
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
  const sql = `UPDATE sessions
               SET points_visible = true,
                   last_active    = ?
               WHERE id = ?`

  const statement = mysql.format(sql, [new Date(), sessionId]);

  runQuery(statement, onComplete);
}

createUser = (user, onComplete) => {
  const {given_name, family_name, email, name, picture, sub} = user;

  if (!email || !sub) {
    console.error(`No ID or Provider, unable to write user. ID: '${id}', Provider: '${provider}'`)
    onComplete("Missing user id or provider id");
  } else {

    // find a way to migrate existing users until they're all moved over

    const sql = `
      INSERT INTO USER
      (first_name, last_name, provider_id, name, photo_url, date_joined, updated, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY
      UPDATE
        first_name = ?, last_name = ?, name = ?, photo_url = ?, updated = ?, email = ?
    `
    const now = new Date();
    const statement = mysql.format(sql, [given_name, family_name, sub, name, picture, now, now, email, given_name, family_name, name, picture, now, email]);

    runQuery(statement, onComplete);
  }
}

incrementCelebration = (sessionId) => {
  const sql = `
    INSERT INTO CELEBRATION
      (session_id, count)
    VALUES (?, ?) ON DUPLICATE KEY
    UPDATE count = count + 1;
  `

  const statement = mysql.format(sql, [sessionId, 1]);

  runQuery(statement);
}

verifySessionPassword = (sessionId, onComplete) => {
  const sql = `select *
               from sessions s
                      left join session_passcode p on p.session_id = s.id
               where s.id = ?;`

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
}

module.exports = {
  initDB,
  getAllSessions,
  createSession,
  terminateSession,
  getSessionParticipants,
  addParticipantToSession,
  removeParticipantFromSession,
  pointWasSubmitted,
  resetPointsForSession,
  revealPointsForSession,
  createUser,
  incrementCelebration,
  writePassCode,
  getSessionData,
  verifySessionPassword,
  setSessionAdmin,
  getSessionDetails,
  getUserAdminSessions
}
