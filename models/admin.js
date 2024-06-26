'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Admin.belongsTo(models.UserData,{foreignKey:'userId'})
    }
  }
  Admin.init({
    userId: DataTypes.NUMBER,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Admin',
    hooks:{
      beforeCreate:(admin)=>{
        admin.role = 'Admin'
      }
    }
  });
  return Admin;
};