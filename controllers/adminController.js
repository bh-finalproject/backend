const { comparePassword } = require('../helpers/bcrypt')
const {cookienize} = require('../helpers/cookies')
const { signToken } = require('../helpers/jwt')
const {sequelize, UserData, Admin,Item} = require('../models')
const AdminServices = require('../services/adminServices')
const UserServices = require('../services/userServices')



class AdminController{
    static async postLogin(req,res,next){
        try {
            const {email,password} = req.body
            if (!email || !password) throw{name:"EmailPasswordInvalid"}
            const getUserData = await UserData.findOne({where:{email}})
            if (!getUserData) throw{name:"AuthenticationError"}
            let getAdmin = await Admin.findOne({where:{userId:getUserData.id}})

            if (!getAdmin ) throw{name:"AuthenticationError"}

            const verifPass = comparePassword(password,getUserData.password)

            if (!verifPass) throw{name:"AuthenticationError"}

            let access_token = signToken({email:getUserData.email})
            
            const cookieString = cookienize(access_token)
            res.cookie(cookieString);
            
            getAdmin = JSON.parse(JSON.stringify(getAdmin))

            delete getAdmin["password"]
            delete getAdmin["createdAt"]
            delete getAdmin["updatedAt"]
            const returnObj = {
                status: 200,
                message:`Login Successful`,
                access_token,
                data:getAdmin
            }

            res.status(200).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async postRegister(req,res,next){
        try {
            const {username,email, password,phoneNumber } = req.body
            if (!username || !email || !password || !phoneNumber) throw{name:"cannotEmpty"}

            const createUserData = await UserData.create(req.body)

            const createAdmin = await Admin.create({userId:createUserData.id})

            const returnObj = {
                status: 201,
                message: "Register account success"
            }

            res.status(201).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async getAllItems(req,res,next){
        try {
            const allItems = await AdminServices.getAllItemPaginated(req.query)

            const returnObj = {
                status: 200,
                message: "Success",
                data:allItems
            }

            res.status(200).json(returnObj)
        } catch (err) {
            next(err)
        }
    }

    static async getItemRent(req,res,next){
        const {id} = req.body
        try {
            const getItemRent = await AdminServices.getRentedItems(id)
            
            const returnObj = {
                status: 200,
                message: "Success",
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
            const getItemRent = await AdminServices.getItemForRent(ids)
            
            if (!getItemRent || getItemRent.length == 0 || getItemRent.length != ids.length) throw{name:"NotFound"}

            for (let item of getItemRent){
                if (objItems[item.id].jumlah > item.jumlah){
                    throw{name:"NotEnough"}
                }
            }
           
            await AdminServices.postItemRent(items,t)

            const returnObj = {
                status: 201,
                message:"Rent process success"
            }

            res.status(201).json(returnObj)
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

    static async patchRentReturn(req,res,next){
        try {
            const t = await sequelize.transaction()
            const getRentItem = await AdminServices.getRentItem(req.params.id)
            
            if (!getRentItem) throw{name:"NotFound"}
            // console.log(getRentItem)
            if (getRentItem.status == "Sudah Dikembalikan"){
                throw{name:"AlreadyReturned"}
            }

            await AdminServices.patchRentReturn(req.params.id,t)

            const returnObj = {
                status:200,
                message:"Item has been returned"
            }

            res.status(200).json(returnObj)
        } catch (err) {
            next(err)
            
        }
        
    }
    static async postAddItem(req,res,next){
        try {
            const t = await sequelize.transaction()
            const{namaBarang, jumlah, kategori, lokasi, deskripsi} = req.body
            const gambar = 'items/'+req.file.filename

            if(!namaBarang || !jumlah || !kategori || !lokasi || !deskripsi || !gambar){
                throw{name:"cannotEmpty"}
            }

            const data = await AdminServices.postAddItem(req.body, gambar,t)

            const returnObj = {
                status:201,
                message:"Success",
                data
            }

            res.status(201).json(returnObj)


        } catch (err) {
            next(err)
        }
    }

    static async postEditItem(req,res,next){
        try {
            const t = await sequelize.transaction()
            const {id} = req.params
            const getItem = await Item.findByPk(id)
            if (!getItem){
                throw{name:"NotFound"}
            }
            let gambar = ''
            const{namaBarang, jumlah, kategori, lokasi, deskripsi} = req.body
            if(!req.file){
                gambar = getItem.gambar
            }
            else{
                gambar = 'items/'+req.file.filename
            }

            if(!namaBarang || !jumlah || !kategori || !lokasi || !deskripsi || !gambar){
                throw{name:"cannotEmpty"}
            }

            const data = await AdminServices.postEditItem(req.body, gambar,id,t)
            const returnObj = {
                status:200,
                message:"Success",
                data
            }
            res.status(200).json(returnObj)

        } catch (err) {
            next(err)
        }
    }

    static async deleteItem(req,res,next){
        try {
            const t = await sequelize.transaction()
            const {id} = req.params
            const getItem = await Item.findByPk(id)
            if (!getItem) throw{name:"NotFound"}

            const data = await AdminServices.deleteItem(id, t)

            const returnObj = {
                status:200,
                message:"Item has been deleted"
            }            
            res.status(200).json(returnObj)

        } catch (err) {
            next(err)
        }
    }

}

module.exports = AdminController