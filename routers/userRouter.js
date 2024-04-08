const express = require('express')
const authentication = require('../middlewares/authentication')
const UserController = require('../controllers/userController')
const userRouter = express.Router()

userRouter.post('/login', UserController.userLogin)
userRouter.post('/register',UserController.userRegister)
userRouter.get('/items',authentication,UserController.getAllItems)
userRouter.get('/item/:id',authentication,UserController.getItemDetail)
// userRouter.post('/rent-items',()=>{})


module.exports = userRouter