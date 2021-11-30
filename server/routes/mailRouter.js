let express = require('express');
let mailRouter = express.Router();
const sendgrid = require('@sendgrid/mail');
let handlebars = require('handlebars');

mailRouter.get('send', function(req, res, next){
  testValue = {
    name: '鈴木太郎',
    orderId: 'abcde012345',
    itemName: '人生ゲーム2021'
  }
  let templete = handlebars.compile(req.body['html']);
  let html = templete(testValue);
  sendMail(req.body['to'], req.body['subject'], html)
  .then(() => res.json(true))
  .catch(error => {
    console.log(error);
    res.json(false);
  })
});

async function sendMail(to, subject, html) {
    await sendgrid.send({
      to: to,
      from: 'noreply@enginestarter.nl',
      subject: subject,
      html: html
    });
}

module.exports = mailRouter;