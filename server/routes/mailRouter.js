let express = require('express');
let mailRouter = express.Router();
const sendgrid = require('@sendgrid/mail');

mailRouter.get('send', function(req, res, next){

});

async function sendMail(to, sub, html) {
    await sendgrid.send({
      to: to,
      from: 'noreply@enginestarter.nl',
      subject: subject,
      html: html
    });
}

module.exports = mailRouter;