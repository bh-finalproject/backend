const { comparePassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const {User,UserData} = require('../models')

class UserController{
    static async userLogin(req,res,next){
        try {
            const {email,password} = req.body
            if (!email || !password) throw{name:"EmailPasswordInvalid"}
            const getUserData = await UserData.findOne({where:{email}})
            const getUser = await User.findOne({where:{userId:getUserData.id}})

            if (!getUser || !getUserData) throw{name:"AuthenticationError"}

            const verifPass = comparePassword(password,getUserData.password)

            if (!verifPass) throw{name:"AuthenticationError"}

            const access_token = signToken({email:getUserData.email})

            res.status(200).json({access_token:`Bearer ${access_token}`})

        } catch (err) {
            next(err)
        }
    }
}

module.exports = UserController