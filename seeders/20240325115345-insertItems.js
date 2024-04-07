'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = require('../data/items.json')

    data.forEach(el=>{
      el.createdAt = new Date()
      el.updatedAt = new Date()
    })

    await queryInterface.bulkInsert('Items',data,{})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Items',null,{})
  }
};
