const express = require('express')
const AdminController = require('../controllers/adminController')
const authenticationAdmin = require('../middlewares/authenticationAdmin')
const adminRouter = express.Router()

adminRouter.post('/login',AdminController.postLogin)
adminRouter.post('/register',AdminController.postRegister)
adminRouter.get('/items',AdminController.getAllItems)
adminRouter.get('/rented-item',authenticationAdmin,AdminController.getItemRent)
adminRouter.post('/item-for-rent',authenticationAdmin, AdminController.postItemRent)
adminRouter.get('/item/:id',AdminController.getItemDetail)
adminRouter.patch('/return-item/:id',authenticationAdmin,AdminController.patchRentReturn)


module.exports = adminRouter