const {User,UserData, Item} = require('../models')
const { Op } = require("sequelize");


class UserServices{
    static async getAllItemPaginated(query){
        const { filter, sort, page } = query;
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
       
        paramQuerySQL.attributes = ['id','namaBarang','jumlah','kategori','gambar']
        try {
            const data = await Item.findAll(paramQuerySQL);
            return data
        
       } catch (error) {
            return error
       }
    }
}


module.exports = UserServices