const nodemailer  = require('nodemailer');

const moment = require('moment');
const errorHandler = require('../middlewares/errorHandler');

//setup transporter
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: 'mediinventory_bithealth@outlook.com',
      pass: process.env.NODEMAILER_PASS
    }
  });


  
const mailOptions = {
    from: 'mediinventory_bithealth@outlook.com',
    to: '',
    subject: 'Reminder Pengembalian Barang',
    text: ''
  };

// class NodeMailer{
//     static sendNewRent(email, items){

//     }
// }

async function  getStillRent(){
  try{
      const getAllRentInRent = await Rent.findAll({where:{status:"Sedang Dipinjam"},
      include:[
         { model:UserData},
          {model:Item}
      ],
      order:["userId"]
      },
  )
      return getAllRentInRent
  }
  catch(err){
      console.log(err)
  }
 
}
const testSend = async ()=>{

    const allInRent = await getStillRent()


    if (!allInRent || allInRent.length == 0){
      return
    } else{
      let objUser = {}
      for (let item of allInRent){
        let tanggalKembali = moment(item.tanggalKembali,'YYYY MM DD')
        let curr = moment()
        let diff = curr.diff(tanggalKembali,'days')
        if (diff >= -7 && item.status == "Sedang Dipinjam"){
          if (!objUser[item.userId]){
            objUser[item.userId] = {
              userId:item.userId,
              itemList : [item.Item.namaBarang],
              userName : item.UserDatum.username,
              jumlah : [item.jumlah],
              dateDiff : [diff],
              email : item.UserDatum.email
            }
          } else{
            objUser[item.userId].itemList.push(item.Item.namaBarang)
            objUser[item.userId].dateDiff.push(diff)
            objUser[item.userId].jumlah.push(item.jumlah)
          }      
        }
        
      }


      for (let item in objUser){
        setTimeout(()=>
        {mailOptions.to = objUser[item].email
        let emailText = `
            Dear ${objUser[item].userName}

            Anda memiliki barang yang sedang dalam status pinjaman dan sebentar lagi akan jatuh tempo atau sudah jatuh tempo

            Barang yang anda pinjamkan berupa:
            `

        for (let i = 0; i < objUser[item].itemList.length; i++){
          emailText+= `
          - ${objUser[item].itemList[i]}, jumlah ${objUser[item].jumlah[i]}, ${objUser[item].dateDiff[i] < 0 ? "jatuh tempo dalam " + Math.abs(objUser[item].dateDiff[i]) + " hari": "lewat dari batas peminjaman"} 
          \n`
        }

        emailText +=`
        Kami ingatkan keterlambatan pengembalian barang akan dikenai biaya denda.
        

        Tim Mediinventory
        `
        mailOptions.text = emailText

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
         console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        })},3000)
      }
        
    }
  
    
}


module.exports = testSend