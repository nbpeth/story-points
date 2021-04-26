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
  const sql = `
    select sessions.id as id, sessions.session_name as sessionName, sessions.last_active as lastActive, participantCount, badges
from sessions
         left join (SELECT s.id as session_id, (GROUP_CONCAT(sb.name)) as badges
                    from session_badge sb,
                         session_earned_badge seb,
                         sessions s
                    where s.id = seb.session_id
                      and seb.badge_id = sb.id
                    group by s.id) as seb on sessions.id = seb.session_id
         left join (select s.id, s.session_name, s.last_active, count(p.id) as participantCount
                    from sessions s,
                         participant p
                    where s.id = p.session_id
                    group by s.session_name) as b
                   on sessions.id = b.id;
  `

  const statement = mysql.format(sql, []);

  runQuery(statement, onComplete)
}

getIdBySessionName = (sessionName, onComplete) => {
  const sql = `select id from sessions where session_name = ?;`;

  const statement = mysql.format(sql, [sessionName]);

  runQuery(statement, onComplete)
}

assignBadge = (sessionId, badgeId, onComplete) => {
  const sql = `insert into session_earned_badge (session_id, badge_id) values (?,?)`

  const statement = mysql.format(sql, [sessionId, badgeId]);

  runQuery(statement, onComplete)
}

createSession = (sessionName, onComplete) => {
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
    // didn't write user
    onComplete();
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

incrementCelebration = (sessionId, onComplete) => {
  const sql = `
    INSERT INTO CELEBRATION
    (session_id, count)
    VALUES
    (?, ?)
    ON DUPLICATE KEY UPDATE count = count + 1;
  `

  const statement = mysql.format(sql, [sessionId, 1]);

  runQuery(statement, onComplete);
}

getCelebrationBadgeDataFor = (sessionId, onComplete) => {
  const sql = `
    select * from celebration c
    left join session_earned_badge seb
    on c.session_id = seb.session_id
    where c.session_id = ?
  `

  const statement = mysql.format(sql, [sessionId]);

  runQuery(statement, onComplete);
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
  assignBadge,
  getIdBySessionName,
  getCelebrationBadgeDataFor
}
