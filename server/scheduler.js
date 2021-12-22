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
        console.log('Error: Write file failed. Aborting...');
        exit(1);
    }
});

let User = require('./models/user');
let Config = require('./models/config');
let Data = require('./models/data');
let Mail = require('./models/mail');
let mailDesign = require('./models/mailDesign');
const { exit } = require('process');

const job = schedule.scheduleJob('*/40 * * * * *', () => {
    console.log('Start the scheduler program');
    main();
});

function main() {
    User.find({}, (error, users) => {
        if(error){
            log(error);
            return;
        }
        users.forEach(user => {
            Config.findOne({email: user.email}, (error, config) => {
                if(error){
                    log(error);
                    return;
                }
                dataUpdate(user.access_token, user.refresh_token)
                    .then(()=> console.log('Success!'))
                    .catch(error => log(error));
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
    /**
     * How dulation is decided?
     * For test, set 1 month.
     * Considering to dulation of Config, it will be 2 month  
     */

    date = new Date(date.setMonth((date.getMonth() + 1 - 2)));
    try {
        let result = await sellingPartner.callAPI({
            api_path: '/orders/v0/orders',
            method: 'GET',
            query: {
                CreatedAfter: date.toISOString(),
                MarketplaceIds: MACKETPLACEID
            }
        });
        let orderList = result.Orders;
        await Promise.all(orderList.map(async order => {
            let result= await sellingPartner.callAPI({
                api_path: `/orders/v0/orders/${order.AmazonOrderId}/buyerInfo`,
                method: 'GET',
            });
            const buyerEmail = result.BuyerEmail;
            result= await sellingPartner.callAPI({
                api_path: `/orders/v0/orders/${order.AmazonOrderId}/orderItems`,
                method: 'GET',
            }); 
            const itemName = result.OrderItems[0].Title;
            console.log(buyerEmail + itemName);
        }));

        



        //console.log(orderList);
        /*while('NextToken' in result){
            if(result.NextToken !== ''){
                result = await sellingPartner.callAPI({
                    api_path: '/orders/v0/orders',
                    method: 'GET',
                    query: {
                        CreatedAfter: date.toISOString(),
                        MarketplaceIds: MACKETPLACEID,
                        NextToken: result.NextToken
                    }
                });
                console.log(result);
                orderList.push(result.Orders);
            }
            else{
                break;
            }
        }*/
        //console.log(orderList.length);
    }
    catch(e){
        throw e;
    }
}

async function getOrder(sellingPartner){
    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    /**
     * How dulation is decided?
     * For test, set 1 month.
     * Considering to dulation of Config, it will be 2 month  
     */

    date = new Date(date.setMonth((date.getMonth() + 1 - 2)));
    let result = await sellingPartner.callAPI({
        api_path: '/orders/v0/orders',
        method: 'GET',
        query: {
            CreatedAfter: date.toISOString(),
            MarketplaceIds: MACKETPLACEID
        }
    });
    return result;
}

async function getBuyerInfo(sellingPartner, id){
    let result = await sellingPartner.callAPI({
        api_path: `/orders/v0/orders/${id}/buyerInfo`,
        method: 'GET',
    });
    return result;
}



function log(str) {
    const now = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    fs.appendFile(filepath, now +': '+ str + '\n', error => {
        if(error){
            console.log('Error: Append file failed. Aborting...');
            exit(1);
        }
    });
}


