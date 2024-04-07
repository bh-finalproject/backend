const express = require('express')
const authentication = require('../middlewares/authentication')
const UserController = require('../controllers/userController')
const userRouter = express.Router()

userRouter.post('/login', UserController.userLogin)
// userRouter.post('/register',()=>{})
// userRouter.get('/items',()=>{})
// userRouter.post('/add-item',()=>{})
// userRouter.get('/items/:id',()=>{})
// userRouter.post('/items/:id',()=>{})


module.exports = userRouter