const { comparePassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const {sequelize, UserData, User} = require('../models')
const UserServices = require('../services/userServices')



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

    static async userRegister(req,res,next){
        try {
            const {email, password,phoneNumber } = req.body
            if (!email || !password || !phoneNumber) throw{name:"cannotEmpty"}

            const createUserData = await UserData.create(req.body)

            const createUser = await User.create({userId:createUserData.id})

            res.status(201).json({ message: "Register account success" })
        } catch (err) {
            next(err)
        }
    }

    static async getAllItems(req,res,next){
        try {
            const allItems = await UserServices.getAllItemPaginated(req.query)

            res.status(200).json(allItems)
        } catch (err) {
            next(err)
        }
    }

    static async getItemDetail(req,res,next){
        try {
            const getItem = await Item.findByPk(req.params.id)

            if (!getItem) throw{name:"NotFound"}
            res.status(200).json(getItem)
        } catch (err) {
            next(err)
        }
    }

    static async getItemRent(req,res,next){
        const {ids} = req.body
        try {
            const getItemRent = await UserServices.getItemForRent(ids)
            if (!getItemRent) throw{name:"NotFound"}
            res.status(200).json(getItemRent)
        } catch (err) {
            next(err)
        }
    }

    static async postItemRent(req,res,next){
        let {items} = req.body
        const ids = items.map(el=>{
            return el.id
        })
        
        try {
            const t = await sequelize.transaction()
            const getItemRent = await UserServices.getItemForRent(ids)
            if (!getItemRent) throw{name:"NotFound"}

            await UserServices.postItemRent(items,t)

            res.status(201).json({message:"Rent process success"})
        } catch (err) {
            next(err)
        }
    }
}

module.exports = UserController