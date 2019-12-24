const sanitize = require('mongo-sanitize');
const url = 'mongodb://localhost:27017/storypoints';

const mongoClient = require('mongodb').MongoClient;
let dbClient

getAllSessions = () =>
    dbClient.find({}).toArray()
        .then((docs) => {
            const convertArrayToObject = (res, next) => {
                res[next['_id']] = next;
                return res;
            }
            return docs.reduce(convertArrayToObject, {});
        })

getStateForSession = (requestedSession) =>
    dbClient.findOne({ _id: requestedSession })

createSession = (messageData) => {
    const payload = messageData.payload;
    const sessionName = payload && payload.sessionName ? payload.sessionName : undefined;

    if (!sessionName) {
        return Promise.reject('Invalid name for session');
    }

    const cleanSessionName = cleanString(sessionName);

    return dbClient.insertOne({ _id: cleanSessionName, participants: {} })
        .then((_) =>
            getAllSessions()
        )
}

addParticipantToSession = (requestedSession, participantToAdd, isAdmin) => {
    const user = `participants.${cleanString(participantToAdd)}`;
    return dbClient.updateOne({ _id: requestedSession }, { $set: { [user]: { point: 0, isAdmin: sanitize(isAdmin) } } })
        .then((_) => getStateForSession(requestedSession))

}

removeParticipantFromSession = (requestedSession, participantToRemove) => {
    const cleanUserName = cleanString(participantToRemove);
    const user = `participants.${cleanUserName}`;

    return dbClient.updateOne({ _id: requestedSession }, { $unset: { [user]: {} } })
        .then((_) => getStateForSession(requestedSession))

}

pointWasSubmitted = (requestedSession, targetUser, point) =>
    getStateForSession(requestedSession).then((sessionState) => {
        const adjusted = { ...sessionState, participants: { ...sessionState.participants, [targetUser]: { ...sessionState.participants[targetUser], point: sanitize(point), hasVoted: true } } }
        return dbClient.updateOne({ _id: requestedSession }, { $set: adjusted }).then((_) => getStateForSession(requestedSession))
    })


terminateSession = (sessionName) =>
    dbClient.deleteOne({ _id: sessionName })
        .then((_) =>
            getAllSessions()
        )


resetPoints = (requestedSession) =>
    getStateForSession(requestedSession).then((stateForSession) => {

        Object.values(stateForSession).forEach(participant => {
            Object.values(participant).forEach(p => {
                if (p) {
                    p['hasVoted'] = false;
                    p.point = 0;
                }
            });
        });

        return dbClient.updateOne({ _id: requestedSession }, { $set: { participants: stateForSession.participants } })
            .then((_) =>
                getStateForSession(requestedSession)
            )
    })



dbConnected = (db) => {
    dbClient = db.db('storypoints').collection('sessions');
}

cleanString = (value) => {
    return sanitize(value).replace(/\./g, "");
}

module.exports = {
    connect: async () => {
        return mongoClient.connect(url, {})
            .then(dbConnected)
    },
    createSession: createSession,
    getAllSessions: getAllSessions,
    getStateForSession: getStateForSession,
    addParticipantToSession: addParticipantToSession,
    removeParticipantFromSession: removeParticipantFromSession,
    pointWasSubmitted: pointWasSubmitted,
    terminateSession: terminateSession,
    resetPoints: resetPoints,
}
