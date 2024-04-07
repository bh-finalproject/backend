const jwt = require('jsonwebtoken')
const PRIVATE_KEY = process.env.PRIVATE_KEY

function signToken(data) {
    return jwt.sign(data, PRIVATE_KEY,{expiresIn:'15m'})
}

function verifyToken(token) {
    return jwt.verify(token, PRIVATE_KEY)
}

module.exports = {
    signToken,
    verifyToken
}