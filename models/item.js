'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item.hasMany(models.Rent,{foreignKey:'itemId'})
    }
  }
  Item.init({
    namaBarang: {
      type:DataTypes.STRING,
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
    jumlah: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        },
        min:{
          args:[0],
          msg:'Minimum 0'
        }
      }
    },
    kategori: {
      type:DataTypes.STRING,
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
    lokasi: {
      type:DataTypes.STRING,
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
    gambar: {
      type:DataTypes.STRING,
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
    deskripsi: {
      type:DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};