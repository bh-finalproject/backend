const { comparePassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const {sequelize, UserData, User,Item,Rent} = require('../models')
const UserServices = require('../services/userServices')
const cookie = require('cookie');
const { Op } = require("sequelize");


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
        const { filter, sort, page, search } = req.query;
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
        }
        else{
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

        //search
        if (search !== '' && typeof search !== 'undefined'){
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
            if (id != req.user.id){
                throw{name:"Forbidden"}
            }
            const getItemRent =await Rent.findAll({where:{userId:id},
                include:[{model:Item, attributes:['namaBarang','gambar']}]})
            
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
         
        
        const t = await sequelize.transaction()
        try {
            const getItemRent = await Item.findAll({where:{id:{[Op.in]:ids}}})
            
            if (!getItemRent || getItemRent.length == 0 || getItemRent.length != ids.length) throw{name:"NotFound"}
            // console.log(getItemRent)
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



            // await UserServices.postItemRent(items,t)

            const returnObj = {
                status:201,
                message:"Rent process success"
            }

            res.status(201).json(returnObj)
        } catch (err) {
            await t.rollback()
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

            let patchRent = await Rent.update({status:'Sudah Dikembalikan'},{where:{id:req.params.id}},{transaction:t})
            const getRent = await Rent.findByPk(req.params.id)
            const getItem = await Item.findByPk(getRent.itemId)
            await getItem.increment('jumlah',{by:getRent.jumlah},{transaction:t})

            await t.commit()


            // await UserServices.patchRentReturn(req.params.id,t)
            
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
}

module.exports = UserController