const express = require('express')
const userRouter = require('./userRouter')
const adminRouter = require('./adminRouter')
const errorHandler = require('../middlewares/errorHandler')
const router = express.Router()

router.use('/user',userRouter)
router.use('/admin',adminRouter)

router.use(errorHandler)


module.exports = router