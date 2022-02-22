let express = require('express');
let mailRouter = express.Router();
const sendgrid = require('@sendgrid/mail');
let handlebars = require('handlebars');
require('dotenv').config();

mailRouter.post('/send', function(req, res, next){
  const testValue = {
    name: '北海太郎',
    orderId: 'ABCDEF123456',
    itemName: 'スルメイカ2杯'
  }
  let templete = handlebars.compile(req.body['html']);
  let html = templete(testValue);
  let templeteSub = handlebars.compile(req.body['subject']);
  let subject = templeteSub(testValue);
  sendMail(req.body['to'], subject, html)
  .then(() => res.json(true))
  .catch(error => {
    console.log(error);
    res.json(false);
  })
});

async function sendMail(to, subject, html) {
    await sendgrid.send({
      to: to,
      from: process.env.EMAILFROM,
      subject: subject,
      html: html
    });
}

module.exports = mailRouter;