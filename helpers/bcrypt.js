const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(8)

function hashPassword(password) {
    return bcrypt.hashSync(password, salt)
}

function comparePassword(passInput, dbPass) {
    return bcrypt.compareSync(passInput, dbPass)
}

module.exports = {
    hashPassword, 
    comparePassword
}