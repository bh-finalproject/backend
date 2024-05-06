'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = require('../data/rent.json')

    data.forEach(el=>{
      el.createdAt = new Date()
      el.updatedAt = new Date()
    })

    await queryInterface.bulkInsert('Rents',data,{})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rents',null,{})
  }
};
