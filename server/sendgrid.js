const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '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');

async function sendgridExample() {
  await sendgrid.send({
    to: 'koki.alright@gmail.com',
    from: 'noreply@mail.nabeking.com',
    subject: 'test',
    html: '<h1>abc123</h1>'
  });
}
sendgridExample()
.then(() => console.log('complete!'))
.catch(error => console.log(error));