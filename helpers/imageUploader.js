const multer = require('multer')
const path = require('path')

let storageItemPhoto =  multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,path.join(__dirname,"../public/items"))
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname +"-" + Date.now() + path.extname(file.originalname))
    }
})

const uploadItemPhoto = multer({storage:storageItemPhoto}).single('gambar')

module.exports = {uploadItemPhoto}