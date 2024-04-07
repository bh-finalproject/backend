const express = require('express')
const adminRouter = express.Router()

adminRouter.post('/login',()=>{})
adminRouter.post('/register',()=>{})
adminRouter.get('/items',()=>{})
adminRouter.post('/add-item',()=>{})
adminRouter.get('/items/:id',()=>{})
adminRouter.put('/items/:id',()=>{})
adminRouter.delete('/items/:id',()=>{})


module.exports = adminRouter