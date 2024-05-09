const express = require('express')
const authentication = require('../middlewares/authentication')
const UserController = require('../controllers/userController')
const userRouter = express.Router()

userRouter.post('/login', UserController.userLogin)
userRouter.post('/register',UserController.userRegister)
userRouter.get('/items',UserController.getAllItems)
userRouter.get('/item/:id',UserController.getItemDetail)
userRouter.use(authentication)
userRouter.get('/rented-item',UserController.getItemRent)
userRouter.post('/item-for-rent', UserController.postItemRent)
userRouter.patch('/return-item/:id',UserController.patchRentReturn)


module.exports = userRouter