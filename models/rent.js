'use strict';
const moment = require('moment')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rent.belongsTo(models.Item,{foreignKey:'itemId'})
      Rent.belongsTo(models.UserData,{foreignKey:'userId'})
    }
  }
  Rent.init({
    itemId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        }
      }
    },
    userId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        }
      }
    },
    status: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        },
        notIn:{
          args:[["Sedang Dipinjam","Sudah Dikembalikan","Belum Dikembalikan"]],
          msg:'Status tidak tepat'
        
        }
      }
    },
    tanggalPinjam: {
      type:DataTypes.DATE,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        }
      }
    },
    tanggalKembali: {
      type:DataTypes.DATE,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        },
        isAfter:{
          args: moment().add(1,'days'),
          msg:'Tanggal kurang dari hari ini'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Rent',
    hooks:{
      beforeBulkCreate:(rents)=>{
        rents.forEach(rent=>{
          rent.status = "Sedang Dipinjam"
        })
      }
    }
  });
  return Rent;
};