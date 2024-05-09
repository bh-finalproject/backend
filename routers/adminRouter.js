const express = require('express')
const AdminController = require('../controllers/adminController')
const authenticationAdmin = require('../middlewares/authenticationAdmin')
const { uploadItemPhoto } = require('../helpers/imageUploader')
const adminRouter = express.Router()

adminRouter.post('/login',AdminController.postLogin)
adminRouter.post('/register',AdminController.postRegister)
adminRouter.get('/items',AdminController.getAllItems)
adminRouter.get('/item/:id',AdminController.getItemDetail)
adminRouter.use(authenticationAdmin)
adminRouter.get('/rented-item',AdminController.getItemRent)
adminRouter.post('/item-for-rent', AdminController.postItemRent)
adminRouter.post('/add-item',uploadItemPhoto,AdminController.postAddItem)
adminRouter.put('/edit-item/:id',uploadItemPhoto,AdminController.postEditItem)
adminRouter.patch('/return-item/:id',AdminController.patchRentReturn)
adminRouter.delete('/delete-item/:id',AdminController.deleteItem)

module.exports = adminRouter