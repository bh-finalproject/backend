const nodemailer  = require('nodemailer');
const { getStillRent } = require('../services/userServices');

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
    to: 'hafiz.fadillah@bithealth.co.id',
    subject: 'test_kirim',
    text: 'testing nodemailer'
  };

// class NodeMailer{
//     static sendNewRent(email, items){

//     }
// }
const testSend = async ()=>{

    const allInRent = await getStillRent()
    console.log(allInRent)
    // transporter.sendMail(mailOptions, function(error, info){
    //     if (error) {
    //    console.log(error);
    //     } else {
    //       console.log('Email sent: ' + info.response);
    //       // do something useful
    //     }
    //   });
    
}

module.exports = testSend