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

app.use(cors({credentials:true, origin:true}))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/static',express.static(path.join(__dirname,'public')))
app.use(router)



// function testInterval(){
//     console.log("jalan tiap 10 detik")
// }

// run email check for once a day
// setInterval(testSend,1000*60*60*24)
setInterval(testSend,1000*15)

module.exports = {app,baseDir}


