const express = require('express')
const userRouter = require('./userRouter')
const adminRouter = require('./adminRouter')
const errorHandler = require('../middlewares/errorHandler')
const router = express.Router()
const {sequelize, UserData, Admin,Item, Rent} = require('../models')
const { QueryTypes } = require('sequelize');


router.use('/user',userRouter)
router.use('/admin',adminRouter)


router.use(errorHandler)


module.exports = router