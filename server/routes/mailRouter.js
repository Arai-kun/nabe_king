let express = require('express');
let mailRouter = express.Router();
const sendgrid = require('@sendgrid/mail');
let handlebars = require('handlebars');

mailRouter.post('/send', function(req, res, next){
  const testValue = {
    name: '鈴木太郎',
    orderId: 'ABCDE012345',
    itemName: 'バナナ'
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