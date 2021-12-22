let mongoose = require('mongoose');
const sendgrid = require('@sendgrid/mail');
const schedule = require('node-schedule');
let fs = require('fs');
const SellingPartnerAPI = require('amazon-sp-api');

const filepath = './error.txt';
const SELLING_PARTNER_APP_CLIENT_ID = 'amzn1.application-oa2-client.d63eca24c26c4108af41e95cd75e9449';
const SELLING_PARTNER_APP_CLIENT_SECRET = '7192fe26b508bc44d21a4f595e4d4b8afb44ad142d5b2cb56a2149db8070739a';
const AWS_ACCESS_KEY_ID = 'AKIAWECJIQCPBTLTQXVD';
const AWS_SECRET_ACCESS_KEY = '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';
const AWS_SELLING_PARTNER_ROLE = 'arn:aws:iam::421060444318:role/Role-SP-API';
const MACKETPLACEID = 'A1VC38T7YXB528'  // Japan


mongoose.connect(
    "mongodb://localhost:27017/nabe_king?authSource=admin",
    {
        useNewUrlParser: true,
        user: "admin",
        pass: "Bach01070202"
    }
);

let db = mongoose.connection;
db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose!");
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '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');

fs.writeFile(filepath, '', error => {
    if(error){
        console.log('File write failed');
        exit(1);
    }
});

let User = require('./models/user');
let Config = require('./models/config');
let Data = require('./models/data');
let Mail = require('./models/mail');
let mailDesign = require('./models/mailDesign');
const { exit } = require('process');

const job = schedule.scheduleJob('*/10 * * * * *', () => {
    console.log('Start the scheduler');
    try{
        main();
    }
    catch(e){
        let now = new Date(new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }));
        fs.appendFile(filepath, now + e);
    }
});

function main() {
    User.find({}, (error, users) => {
        if(error) throw error;
        users.forEach(user => {
            Config.findOne({email: user.email}, (error, config) => {
                if(error) throw error;
                dataUpdate(user.access_token, user.refresh_token)
                    .then(()=> console.log('Success!'))
                    .catch(error => {
                        throw error;
                    })
            }); 
        });
    });
}

async function dataUpdate(access_token, refresh_token) {
    let sellingPartner = new SellingPartnerAPI({
        region: 'fe',
        access_token: access_token,
        refresh_token: refresh_token,
        credentials: {
            SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
            SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
            AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY,
            AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
        }
    });

    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    console.log(date.setMonth((date.getMonth() + 1 - 2)));
    date = new Date(date.setMonth((date.getMonth() + 1 - 2))); // Exctract data from two month ago to now.
    console.log(date);
    try {
        let result = await sellingPartner.callAPI({
            api_path: '/orders/v0/orders',
            method: 'GET',
            query: {
                CreatedAfter: date.toISOString(),
                MarketplaceIds: MACKETPLACEID
            }
        });
        console.log(result);
    }
    catch(e){
        console.log(e);
        throw e;
    }
}



