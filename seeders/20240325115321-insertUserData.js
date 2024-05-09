'use strict';

const {hashPassword} = require('../helpers/bcrypt')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = require('../data/userdata.json')

    data.forEach(el=>{
      el.password = hashPassword(el.password)
      el.createdAt = new Date()
      el.updatedAt = new Date()
    })

    await queryInterface.bulkInsert('UserData',data,{})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserData',null,{})
  }
};
