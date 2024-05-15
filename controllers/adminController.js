const { comparePassword } = require('../helpers/bcrypt')
const {cookienize} = require('../helpers/cookies')
const { signToken } = require('../helpers/jwt')
const {sequelize, UserData, Admin,Item, Rent} = require('../models')
const AdminServices = require('../services/adminServices')
const UserServices = require('../services/userServices')
const { Op } = require("sequelize");



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
            
            getAdmin = JSON.parse(JSON.stringify(getUserData))

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
        const { filter, sort, page,search } = req.query;
        const paramQuerySQL = {};
        let limit;
        let offset;

        // filtering by category
        if (filter !== '' && typeof filter !== 'undefined') {
            const query = filter.kategori.split(',').map((item) => ({
            [Op.eq]: item,
            }));

            paramQuerySQL.where = {
            kategori: { [Op.or]: query },
            };
        }

        // sorting
        if (sort !== '' && typeof sort !== 'undefined') {
            let query;
            if (sort.charAt(0) !== '-') {
            query = [[sort, 'ASC']];
            } else {
            query = [[sort.replace('-', ''), 'DESC']];
            }

            paramQuerySQL.order = query;
        } else{
            paramQuerySQL.order = [['id','ASC']]
        }

        // pagination
        if (page !== '' && typeof page !== 'undefined') {
            if (page.size !== '' && typeof page.size !== 'undefined') {
            limit = page.size;
            paramQuerySQL.limit = limit;
            }

            if (page.number !== '' && typeof page.number !== 'undefined') {
            offset = page.number * limit - limit;
            paramQuerySQL.offset = offset;
            }
        } else {
            limit = 5; // limit 5 item
            offset = 0;
            paramQuerySQL.limit = limit;
            paramQuerySQL.offset = offset;
        }

    
        if (search !== '' && typeof search !== 'undefined'){
            paramQuerySQL.where = {'namaBarang':{}}
            paramQuerySQL.where['namaBarang'] = {[Op.iLike]:`%${search}%`}
        } 
       
        paramQuerySQL.attributes = ['id','namaBarang','jumlah','kategori','gambar']

        try {
            const allItems = await Item.findAll(paramQuerySQL)

            const allItemLength = await Item.findAll()

            const itemLength = allItemLength.length

            const returnObj = {
                status: 200,
                message: "Success",
                length:itemLength,
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
            let params ={}
            if (id){
                params.where = {
                    userId:id
                }
            }

            const getItemRent = await Rent.findAll({params,
                include:[{model:Item, attributes:['namaBarang','gambar']}]})
            
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

        const t = await sequelize.transaction()
        try {
            
            const getItemRent = await Item.findAll({where:{id:{[Op.in]:ids}}})
            
            if (!getItemRent || getItemRent.length == 0 || getItemRent.length != ids.length) throw{name:"NotFound"}

            for (let item of getItemRent){
                if (objItems[item.id].jumlah > item.jumlah){
                    throw{name:"NotEnough"}
                }
            }


            for (let item of items){
                let getItem = await Item.findByPk(item.itemId)
                if (getItem.jumlah < 1) throw{name:"ItemZero"}
                let jumlah = item.jumlah
                item.status = "Sedang Dipinjam"
    
                await Rent.create(item,{transaction:t} )
                await getItem.decrement('jumlah',{by:jumlah},{transaction:t})
            }
            
            
            await t.commit()
           
            // await AdminServices.postItemRent(items,t)

            const returnObj = {
                status: 201,
                message:"Rent process success"
            }

            res.status(201).json(returnObj)
        } catch (err) {
            await t.rollback()
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
        const t = await sequelize.transaction()
        try {
            
            const getRentItem = await Rent.findByPk(req.params.id)
            
            if (!getRentItem) throw{name:"NotFound"}
            // console.log(getRentItem)
            if (getRentItem.status == "Sudah Dikembalikan"){
                throw{name:"AlreadyReturned"}
            }

            
            const getItem = await Item.findByPk(getRentItem.itemId)
            await getItem.increment('jumlah',{by:getRentItem.jumlah},{transaction:t})

            await t.commit()

            // await AdminServices.patchRentReturn(req.params.id,t)

            const returnObj = {
                status:200,
                message:"Item has been returned"
            }

            res.status(200).json(returnObj)
        } catch (err) {
            await t.rollback()
            next(err)
            
        }
        
    }
    static async postAddItem(req,res,next){
        const t = await sequelize.transaction()
        try {
            const{namaBarang, jumlah, kategori, lokasi, deskripsi} = req.body
            const gambar = 'items/'+req.file.filename

            if(!namaBarang || !jumlah || !kategori || !lokasi || !deskripsi || !gambar){
                throw{name:"cannotEmpty"}
            }

            const data = await Item.create({namaBarang,jumlah,kategori,lokasi,deskripsi, gambar},{transaction:t})

            await t.commit()

            // const data = await AdminServices.postAddItem(req.body, gambar,t)

            const returnObj = {
                status:201,
                message:"Success",
                data
            }

            res.status(201).json(returnObj)


        } catch (err) {
            await t.rollback()
            next(err)
        }
    }

    static async postEditItem(req,res,next){
        const t = await sequelize.transaction()
        try {
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

            const result = await Item.update({namaBarang,jumlah,kategori,lokasi,deskripsi,gambar},{where:{id}},{transaction:t})
            await t.commit()
            const data = await Item.findByPk(id)

            // const data = await AdminServices.postEditItem(req.body, gambar,id,t)
            const returnObj = {
                status:200,
                message:"Success",
                data
            }

            res.status(200).json(returnObj)

        } catch (err) {
            await t.rollback()
            next(err)
        }
    }

    static async deleteItem(req,res,next){
        const t = await sequelize.transaction()
        try {
            const {id} = req.params
            const getItem = await Item.findByPk(id)
            if (!getItem) throw{name:"NotFound"}

            const data = await Item.destroy({where:{id:id}},{transaction:t})
            await t.commit()

            const returnObj = {
                status:200,
                message:"Item has been deleted"
            }            
            res.status(200).json(returnObj)

        } catch (err) {
            await t.rollback()
            next(err)
        }
    }

    static async getAllUser(req,res,next){
        try {
            const getUsers = await UserData.findAll({
                attributes:['id','username']
            })

            const returnObj = {
                status:200,
                message:"Success",
                data:getUsers
            }
            res.status(200).json(returnObj)
        } catch (error) {
            next(error)
        }
    }

}

module.exports = AdminController