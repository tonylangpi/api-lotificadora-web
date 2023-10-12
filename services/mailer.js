const nodemailer = require('nodemailer');
require('dotenv').config();
const {EMAIL, PASS} = process.env;

const transporter =  nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: EMAIL,
        pass: PASS
    }
});


transporter.verify().then(()=>{
    console.log('ready for send emails')
}).catch((error)=>{
    console.log(error);
});


module.exports = {transporter}