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
            const getAdmin = await Admin.findOne({where:{userId:getUserData.id}})

            if (!getAdmin ) throw{name:"AuthenticationError"}

            const verifPass = comparePassword(password,getUserData.password)

            if (!verifPass) throw{name:"AuthenticationError"}

            let access_token = signToken({email:getUserData.email})
            
            const cookieString = cookienize(access_token)
            res.cookie(cookieString);

            res.status(200).json({message:`Login Successful`})
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

            res.status(201).json({ message: "Register account success" })
        } catch (err) {
            next(err)
        }
    }

    static async getAllItems(req,res,next){
        try {
            const allItems = await AdminServices.getAllItemPaginated(req.query)

            res.status(200).json(allItems)
        } catch (err) {
            next(err)
        }
    }

    static async getItemRent(req,res,next){
        const {id} = req.body
        try {
            const getItemRent = await AdminServices.getRentedItems(id)
            res.status(200).json(getItemRent)
        } catch (err) {
            next(err)
        }
    }

    static async postItemRent(req,res,next){
        let {items} = req.body
        const ids = items.map(el=>{
            return el.itemId
        })
        
        try {
            const t = await sequelize.transaction()
            const getItemRent = await AdminServices.getItemForRent(ids)
            console.log(getItemRent)
            if (!getItemRent || getItemRent.length == 0 || getItemRent.length != ids.length) throw{name:"NotFound"}

            await AdminServices.postItemRent(items,t)

            res.status(201).json({message:"Rent process success"})
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

            res.status(200).json({message:"Item has been returned"})
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


            res.status(201).json(data)


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
            const result = {
                message:"success",
                data
            }
            res.status(200).json(result)

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

            res.status(200).json({message:"Item has been deleted"})

        } catch (err) {
            next(err)
        }
    }

}

module.exports = AdminController