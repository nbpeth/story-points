const axios = require('axios');


const validateIdToken = async (authHeader) => {
  return await axios.get('https://nameless-meadow-6569.us.auth0.com/userinfo', {
    headers: { 'Authorization': authHeader }
  }).catch(e => {
    throw Error(`Invalid user. Auth header: , "${authHeader}"`)
  })
}

module.exports = {
  validateIdToken
}
