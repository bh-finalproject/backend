const { verifyToken } = require("../helpers/jwt")
const { UserData } = require('../models')
const { decookienize } = require("../helpers/cookies")

async function authentication(req, res, next) {
    try {
        let cookie = req.headers.cookie
        if (!cookie){
            throw({name:"AuthenticationError"})
        }

        let {access_token} = decookienize(cookie)
        
        access_token = access_token.split(' ')[1]
        if(!access_token) throw({name:"AuthenticationError"})
        // console.log(access_token)
        const verified = verifyToken(access_token)
        
        const user = await UserData.findOne({where:{email:verified.email}})
        // console.log('user>>',user)
        if (!user) throw ({ name: "AuthenticationError" })
        req.user = {
            id: user.id,
            email: verified.email
        }
        // console.log(req.user)
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authentication