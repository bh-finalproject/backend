if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const path = require('path')
const express  = require('express')
const app = express()
const cors = require('cors')
const router = require('./routers/router')

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/static',express.static(path.join(__dirname,'public')))
app.use(router)


module.exports = app


