const axios = require('axios');
const jwt = require('jsonwebtoken');
const clientSecret = process.env.JWT_SECRET || "secrets";

const validateAccessToken = async (authHeader) => {
  return await axios.get('https://nameless-meadow-6569.us.auth0.com/userinfo', {
    headers: { 'Authorization': authHeader }
  }).catch(e => {
    throw Error(`Invalid user. Auth header: , "${authHeader}"`)
  })
}

const validateIdToken = async (authHeader) => {
  try {
    return jwt.verify(authHeader.split(" ")[1], clientSecret)
  } catch(e) {
    console.log(e)
    return null;
  }
}



const generateJWT = (authHeader) => {
  return validateAccessToken(authHeader)
    .then(userInfo => {

      return jwt.sign({
        ...userInfo.data
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
