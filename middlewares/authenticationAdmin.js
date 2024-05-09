const { decookienize } = require("../helpers/cookies")
const { verifyToken } = require("../helpers/jwt")
const { UserData, Admin } = require('../models')



async function authenticationAdmin(req, res, next) {
    try {
        // console.log(req.headers,"<<<<HEADERS")
        let cookie = req.headers.cookie

        let {access_token} = decookienize(cookie)
        
        access_token = access_token.split(' ')[1]
        if(!access_token) throw({name:"AuthenticationError"})

        const verified = verifyToken(access_token)
        if (!verified) throw ({ name: "AuthenticationError" })
        
        const user = await UserData.findOne({where:{email:verified.email}})
        // console.log('user>>',user)
        if (!user) throw ({ name: "AuthenticationError" })

        const getAdmin = await Admin.findOne({where:{userId:user.id}})
        if (!getAdmin && getAdmin.role != 'Admin') throw ({ name: "AuthenticationError" })

        req.user = {
            id: verified.id,
            email: verified.email
        }
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authenticationAdmin