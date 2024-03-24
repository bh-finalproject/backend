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
    namaBarang: DataTypes.STRING,
    jumlah: DataTypes.INTEGER,
    kategori: DataTypes.STRING,
    lokasi: DataTypes.STRING,
    gambar: DataTypes.STRING,
    deskripsi: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};