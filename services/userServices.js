const errorHandler = require('../middlewares/errorHandler');
const {User,UserData, Item, Rent, sequelize} = require('../models')
const { Op } = require("sequelize");


class UserServices{
    // static async getAllItemPaginated(query){
    //     const { filter, sort, page, search } = query;
    //     const paramQuerySQL = {};
    //     let limit;
    //     let offset;

    //     // filtering by category
    //     if (filter !== '' && typeof filter !== 'undefined') {
    //         const query = filter.kategori.split(',').map((item) => ({
    //         [Op.eq]: item,
    //         }));

    //         paramQuerySQL.where = {
    //         kategori: { [Op.or]: query },
    //         };
    //     }

    //     // sorting
    //     if (sort !== '' && typeof sort !== 'undefined') {
    //         let query;
    //         if (sort.charAt(0) !== '-') {
    //         query = [[sort, 'ASC']];
    //         } else {
    //         query = [[sort.replace('-', ''), 'DESC']];
    //         }

    //         paramQuerySQL.order = query;
    //     }
    //     else{
    //         paramQuerySQL.order = [['id','ASC']]
    //     }

    //     // pagination
    //     if (page !== '' && typeof page !== 'undefined') {
    //         if (page.size !== '' && typeof page.size !== 'undefined') {
    //         limit = page.size;
    //         paramQuerySQL.limit = limit;
    //         }

    //         if (page.number !== '' && typeof page.number !== 'undefined') {
    //         offset = page.number * limit - limit;
    //         paramQuerySQL.offset = offset;
    //         }
    //     } else {
    //         limit = 5; // limit 5 item
    //         offset = 0;
    //         paramQuerySQL.limit = limit;
    //         paramQuerySQL.offset = offset;
    //     }

    //     //search
    //     if (search !== '' && typeof search !== 'undefined'){
    //         paramQuerySQL.where['namaBarang'] = {[Op.iLike]:`%${search}%`}
    //     }
       
    //     paramQuerySQL.attributes = ['id','namaBarang','jumlah','kategori','gambar']
    //     try {
    //         const data = await Item.findAll(paramQuerySQL);
    //         return data
        
    //    } catch (error) {
    //         throw err
    //    }
    // }

    // static async getItemForRent(ids){
    //     try {
    //         const rentedItems = await Item.findAll({where:{id:{[Op.in]:ids}}})

    //         return rentedItems
    //     } catch (err) {
    //         throw err
    //     }
    // }

    // static async getRentedItems(id){
    //     try {
    //         const rentedItems = await Rent.findAll({where:{userId:id},
    //             include:[{model:Item, attributes:['namaBarang','gambar']}]})
    //         // const rentedItems = await sequelize.query(`
    //         // SELECT 
    //         // r.id,
    //         // r.status,
    //         // i."namaBarang",
    //         // i.lokasi,
    //         // r."tanggalPinjam",
    //         // r."tanggalKembali"
    //         // FROM "Rents" as r 
    //         // left join "Items" i on r."itemId" = i.id
    //         // where r."userId" = ${id}
    //         // `)
    //         return rentedItems
    //     } catch (err) {
    //         throw err
    //     }
    // }

    // static async postItemRent(items,t){
    //    try {
    //     for (let item of items){
    //         let getItem = await Item.findByPk(item.itemId)
    //         if (getItem.jumlah < 1) throw{name:"ItemZero"}
    //         let jumlah = item.jumlah
    //         item.status = "Sedang Dipinjam"

    //         await Rent.create(item,{transaction:t} )
    //         await getItem.decrement('jumlah',{by:jumlah},{transaction:t})
    //     }
   
    //     await t.commit()

    //    } catch (err) {
    //     await t.rollback()
    //     // console.log(err)
    //     throw err
    //    }
    // }

    // static async getRentItem(id){
    //     try {
    //         const getRent = await Rent.findByPk(id)
    //         return getRent
    //     } catch (err) {
    //         throw err
    //     }
    // }

    // static async patchRentReturn(id,t){
    //     try {
    //         let patchRent = await Rent.update({status:'Sudah Dikembalikan'},{where:{id:id}},{transaction:t})
    //         const getRent = await this.getRentItem(id)
    //         const getItem = await Item.findByPk(getRent.itemId)
    //         await getItem.increment('jumlah',{by:getRent.jumlah},{transaction:t})

    //         await t.commit()
    //     } catch (err) {
    //         await t.rollback()
    //         throw err
    //     }
    // }

    // static async getStillRent(){
    //     try{
    //         const getAllRentInRent = await Rent.findAll({where:{status:"Sedang Dipinjam"},
    //         include:[
    //            { model:UserData},
    //             {model:Item}
    //         ],
    //         order:["userId"]
    //         },
    //     )
    //         return getAllRentInRent
    //     }
    //     catch(err){
    //         errorHandler(err)
    //     }
       
    // }
}


module.exports = UserServices