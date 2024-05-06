const { comparePassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const {sequelize, UserData, User,Item} = require('../models')
const UserServices = require('../services/userServices')
const cookie = require('cookie');


function cookienize(token){
    const secureCookie = true;
    const httpOnlyCookie = true;
    const cookieOptions = {
      secure: secureCookie,
      httpOnly: httpOnlyCookie,
    };
  
    const cookieString = cookie.serialize('access_token', 'Bearer '+ token, cookieOptions);

    return cookieString
}


class UserController{
    static async userLogin(req,res,next){
        try {
            const {email,password} = req.body
            if (!email || !password) throw{name:"EmailPasswordInvalid"}
            let getUserData = await UserData.findOne({where:{email}})
            if (!getUserData) throw{name:"AuthenticationError"}
            const getUser = await User.findOne({where:{userId:getUserData.id}})

            if (!getUser ) throw{name:"AuthenticationError"}

            const verifPass = comparePassword(password,getUserData.password)

            if (!verifPass) throw{name:"AuthenticationError"}

            const access_token = signToken({email:getUserData.email})
            const cookieString = cookienize(access_token)
            res.cookie(cookieString);

            getUserData = JSON.parse(JSON.stringify(getUserData))
            delete getUserData["password"]
            delete getUserData["createdAt"]
            delete getUserData["updatedAt"]
            const returnObj = {
                status:200,
                message:`Login Successful`,
                access_token,
                data:getUserData
            }

            res.status(200).json(returnObj)

        } catch (err) {
            next(err)
        }
    }

    static async userRegister(req,res,next){
        try {
            const {username,email, password,phoneNumber } = req.body
            if (!username || !email || !password || !phoneNumber) throw{name:"cannotEmpty"}

            const createUserData = await UserData.create(req.body)

            const createUser = await User.create({userId:createUserData.id})

            const returnObj={
                status:201,
                message:"Register account success"
            }
            res.status(201).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async getAllItems(req,res,next){
        try {
            const allItems = await UserServices.getAllItemPaginated(req.query)
            const returnObj = {
                status:200,
                message:"Success",
                data:allItems
            }
            res.status(200).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async getItemDetail(req,res,next){
        try {
            const getItem = await Item.findByPk(req.params.id)

            if (!getItem) throw{name:"NotFound"}

            const returnObj = {
                status:200,
                message:"Success",
                data:getItem
            }
            res.status(200).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async getItemRent(req,res,next){
        const {id} = req.body
        try {
            const getItemRent = await UserServices.getRentedItems(id)
            
            const returnObj = {
                status:200,
                message:"Success",
                data:getItemRent
            }
            res.status(200).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async postItemRent(req,res,next){
        let {items} = req.body
        const objItems = {}
        const ids = items.map(el=>{
            return el.itemId
        })

        items.forEach(el=>{
            objItems[el.itemId] = el
        })
         
        try {
            const t = await sequelize.transaction()
            const getItemRent = await UserServices.getItemForRent(ids)
            
            if (!getItemRent || getItemRent.length == 0 || getItemRent.length != ids.length) throw{name:"NotFound"}
            console.log(getItemRent)
            for (let item of getItemRent){
                if (objItems[item.id].jumlah > item.jumlah){
                    throw{name:"NotEnough"}
                }
            }
            await UserServices.postItemRent(items,t)

            const returnObj = {
                status:201,
                message:"Rent process success"
            }

            res.status(201).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async patchRentReturn(req,res,next){
        try {
            const t = await sequelize.transaction()
            const getRentItem = await UserServices.getRentItem(req.params.id)
            
            if (!getRentItem) throw{name:"NotFound"}
            // console.log(getRentItem)
            if (getRentItem.status == "Sudah Dikembalikan"){
                throw{name:"AlreadyReturned"}
            }

            await UserServices.patchRentReturn(req.params.id,t)
            
            const returnObj = {
                status:200,
                message:"Item has been returned"
            }

            res.status(200).json(returnObj)
        } catch (err) {
            next(err)
            
        }
    }
}

module.exports = UserController