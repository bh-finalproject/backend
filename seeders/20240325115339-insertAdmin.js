'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   let data = require('../data/admin.json')

   data.forEach(el=>{
    el.createdAt = new Date()
    el.updatedAt = new Date()
   })

   await queryInterface.bulkInsert('Admins',data,{})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins',null,{})
  }
};
