if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const path = require('path')
const express  = require('express')
const app = express()
const cors = require('cors')
const router = require('./routers/router')
const testSend = require('./helpers/nodeMailer')
const baseDir = __dirname

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/static',express.static(path.join(__dirname,'public')))
app.use(router)

// testSend()

// function testInterval(){
//     console.log("jalan tiap 10 detik")
// }


// setInterval(testInterval,10000)

module.exports = {app,baseDir}


