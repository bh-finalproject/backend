'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      itemId: {
        type: Sequelize.INTEGER,
        references:{
          model:'Items',
          key:'id'
        },
        allowNull:false
      },
      userId: {
        type: Sequelize.INTEGER,
        references:{
          model:'UserData',
          key:'id'
        },
        allowNull:false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tanggalPinjam: {
        type: Sequelize.DATE,
        allowNull:false
      },
      tanggalKembali: {
        type: Sequelize.DATE,
        allowNull:false
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
    await queryInterface.dropTable('Rents');
  }
};