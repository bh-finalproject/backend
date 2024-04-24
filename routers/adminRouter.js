const express = require('express')
const AdminController = require('../controllers/adminController')
const authenticationAdmin = require('../middlewares/authenticationAdmin')
const { uploadItemPhoto } = require('../helpers/imageUploader')
const adminRouter = express.Router()

adminRouter.post('/login',AdminController.postLogin)
adminRouter.post('/register',AdminController.postRegister)
adminRouter.get('/items',AdminController.getAllItems)
adminRouter.get('/rented-item',authenticationAdmin,AdminController.getItemRent)
adminRouter.post('/item-for-rent',authenticationAdmin, AdminController.postItemRent)
adminRouter.post('/add-item',authenticationAdmin,uploadItemPhoto,AdminController.postAddItem)
adminRouter.get('/item/:id',AdminController.getItemDetail)
adminRouter.put('/edit-item/:id',authenticationAdmin,uploadItemPhoto,AdminController.postEditItem)
adminRouter.patch('/return-item/:id',authenticationAdmin,AdminController.patchRentReturn)
adminRouter.delete('/delete-item/:id',authenticationAdmin,AdminController.deleteItem)

module.exports = adminRouter