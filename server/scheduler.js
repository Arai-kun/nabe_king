let mongoose = require('mongoose');
const sendgrid = require('@sendgrid/mail');
let fs = require('fs');
let SellingPartnerAPI = require('amazon-sp-api');
const { exit } = require('process');

const filepath = './log.txt';
const SELLING_PARTNER_APP_CLIENT_ID = 'amzn1.application-oa2-client.d63eca24c26c4108af41e95cd75e9449';
const SELLING_PARTNER_APP_CLIENT_SECRET = '7192fe26b508bc44d21a4f595e4d4b8afb44ad142d5b2cb56a2149db8070739a';
const AWS_ACCESS_KEY_ID = 'AKIAWECJIQCPBTLTQXVD';
const AWS_SECRET_ACCESS_KEY = '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';
const AWS_SELLING_PARTNER_ROLE = 'arn:aws:iam::421060444318:role/Role-SP-API';
const MACKETPLACEID = 'A1VC38T7YXB528'  // Japan

console.log('Start the scheduler program');

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

/* Reset every time for saving storage */
fs.writeFile(filepath, '', error => {
    if(error){
        console.log('Write file failed. Abort');
        exit(1);
    }
});

let User = require('./models/user');
let Config = require('./models/config');
let Data = require('./models/data');
let Mail = require('./models/mail');
let mailDesign = require('./models/mailDesign');

main();

async function main() {
    while(1){

        /* Set interval as scheduler */
        const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await _sleep(10000);
        log('Active main()');

        await User.find({}, (error, users) => {
            if(error){
                log(error);
                return;
            }
            for(let user of users){
                Config.findOne({email: user.email}, async (error, config) => {
                    if(error){
                        log(error);
                        return;
                    }
                    await dataUpdate(user)
                        .then(()=> console.log('Success!'))
                        .catch(error => log(error));
                });
            }
        });
    }
}

async function dataUpdate(user) {
    let sellingPartner = new SellingPartnerAPI({
        region: 'fe',
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        credentials: {
            SELLING_PARTNER_APP_CLIENT_ID: SELLING_PARTNER_APP_CLIENT_ID,
            SELLING_PARTNER_APP_CLIENT_SECRET: SELLING_PARTNER_APP_CLIENT_SECRET,
            AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY,
            AWS_SELLING_PARTNER_ROLE: AWS_SELLING_PARTNER_ROLE
        },
        options: {
            auto_request_throttled: false  // Catch rate restrict
        }
    });

    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    
    /**
     * How dulation is decided?
     * For test, set 1 month.
     * Considering to dulation of Config, it will be 2 month  
     */

    date = new Date(date.setMonth((date.getMonth() + 1 - 2)));
    let data_arr = [];
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

        for(let order of orderList){
            try{
                /* Get buyer email */
                let result = await sellingPartner.callAPI({
                    api_path: `/orders/v0/orders/${order.AmazonOrderId}/buyerInfo`,
                    method: 'GET',
                    options: {
                        raw_result: true
                    }
                });
                //console.log(result);
                const buyerEmail = JSON.parse(result.body).payload.BuyerEmail;
                console.log(buyerEmail);

                /* Get item name */
                let result2 = await sellingPartner.callAPI({
                    api_path: `/orders/v0/orders/${order.AmazonOrderId}/orderItems`,
                    method: 'GET',
                    options: {
                        raw_result: true
                    }
                });
                //console.log(result2);
                const itemName = JSON.parse(result2.body).payload.OrderItems[0].Title;
                console.log(itemName)
            

                data_arr.push({
                    orderId: order.AmazonOrderId,
                    purchaseDate: new Date(order.PurchaseDate),
                    orderStatus: order.OrderStatus,
                    shippedDate: null,
                    buyerEmail: buyerEmail,
                    buyerName: '',
                    itemName: itemName,
                    isSent: false,
                    unSend: false,
                    sendTarget: false
                });

                console.log(data_arr);

                const rate = result.headers['x-amzn-ratelimit-limit'];
                console.log(rate);
                const rate2 = result2.headers['x-amzn-ratelimit-limit'];
                console.log(rate2);
                const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                await _sleep(100000);
            }
            catch(error){
                log(error);
            }
        }

        Data.updateOne({email: user.email}, {
            data_arr: data_arr
        }, error => {
            if(error){
                log(error);
                return;
            }
        });

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
    catch(error){
        log(error);
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
            console.log('Append file failed. Abort');
            exit(1);
        }
    });
}


