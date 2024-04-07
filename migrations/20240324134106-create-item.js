'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      namaBarang: {
        type: Sequelize.STRING
      },
      jumlah: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      kategori: {
        type: Sequelize.STRING,
        allowNull:false
      },
      lokasi: {
        type: Sequelize.STRING,
        allowNull:false
      },
      gambar: {
        type: Sequelize.STRING,
        allowNull:false
      },
      deskripsi: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Items');
  }
};