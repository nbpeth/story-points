const axios = require('axios');
const jwt = require('jsonwebtoken');
const clientSecret = process.env.JWT_SECRET || "secrets";
const auth0Url = process.env.AUTH0_URL || "https://nameless-meadow-6569.us.auth0.com/userinfo";

// verify auth0 token
const validateAccessToken = async (authHeader) => {
  return await axios.get(auth0Url, {
    headers: { 'Authorization': authHeader }
  }).catch(e => {
    console.error(e);
    return Promise.reject(`Invalid user. Auth header: , "${authHeader}"`)
  })
}

// verify self issued token
const validateIdToken = async (authHeader) => {
  try {
    return jwt.verify(stripTokenFromAuthHeader(authHeader), clientSecret)
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

const stripTokenFromAuthHeader = (authHeader) => {
  return authHeader.split(" ")[1] || "";
}

module.exports = {
  decode,
  generateJWT,
  validateAccessToken,
  validateIdToken,
  stripTokenFromAuthHeader
}
