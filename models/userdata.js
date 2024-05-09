'use strict';
const {
  Model
} = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');
module.exports = (sequelize, DataTypes) => {
  class UserData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserData.hasOne(models.User,{foreignKey:'userId'})
      UserData.hasOne(models.Admin,{foreignKey:'userId'})
      UserData.hasMany(models.Rent,{foreignKey:'userId'})
    }
  }
  UserData.init({
    username: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        }
      },
      unique:{
        msg:'Username sudah terdaftar'
      }
    },
    email: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        },
        isEmail:{
          msg:'Format wajib email'
        }
      },
      unique:{
        msg:'Email sudah terdaftar'
      }
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Tidak boleh null'
        },
        notEmpty:{
          msg:'Tidak boleh kosong'
        },
        minLength(val){
          if (val.length < 5){
            throw new Error ("Minimum 5 karakter")
        }
      }
      }
    },
    phoneNumber: {
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
    }
  }, 
  {
    sequelize,
    modelName: 'UserData',
    hooks:{
      beforeCreate: (userdata)=>{
        userdata.password = hashPassword(userdata.password)
      }
    }
  });
  return UserData;
};