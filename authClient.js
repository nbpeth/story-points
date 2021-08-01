const axios = require('axios');
const jwt = require('jsonwebtoken');
const clientSecret = process.env.JWT_SECRET || "secrets";
const mysqlClient = require('./mysqlClient');

// verify auth0 token
const validateAccessToken = async (authHeader) => {
  return await axios.get('https://nameless-meadow-6569.us.auth0.com/userinfo', {
    headers: { 'Authorization': authHeader }
  }).catch(e => {
    throw Error(`Invalid user. Auth header: , "${authHeader}"`)
  })
}

// verify self issued token
const validateIdToken = async (authHeader) => {
  try {
    return jwt.verify(authHeader.split(" ")[1], clientSecret)
  } catch(e) {
    console.error(`Invalid auth header: ${authHeader}`)
    return null;
  }
}

const generateJWT = (authHeader) => {
  return validateAccessToken(authHeader)
    .then(userInfoWithCustomClaims => {
      return jwt.sign({
        ...userInfoWithCustomClaims.data
      }, clientSecret);
    })
}

const decode = (token) => jwt.decode(token);

module.exports = {
  decode,
  generateJWT,
  validateAccessToken,
  validateIdToken
}
