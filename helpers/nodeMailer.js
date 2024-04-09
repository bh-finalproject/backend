const nodemailer  = require('nodemailer')

//setup transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hello@example.com',
      pass: process.env.NODEMAILER_PASS
    }
  });

// setup mail options
const mailOptions = {
    from: 'hello@example.com',
    to: '',
    subject: '',
    text: ''
  };

class NodeMailer{
    static sendNewRent(email, items){

    }
}

module.exports = NodeMailer