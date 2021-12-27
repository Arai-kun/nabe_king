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

        try{
            let users = await User.find({}).exec();
            for(let user of users){
                //await dataUpdate(user);
                let res = await Data.findOne({email: user.email, data_arr:[{orderId: '250-8518387-7582213'}]});
                console.log(res);
                let config = await Config.findOne({email: user.email}).exec();
                await configSet(config);

            }
        }
        catch(error){
            log(error);
        }

        /*
        User.find({}, (error, users) => {
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
                    await dataUpdate(user);
                });
            }
        });*/
    }
}

async function dataUpdate(user) {
    log('Enter in dataUpdate()');
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
    let orderList = [];
    try {
        let result = await sellingPartner.callAPI({
            api_path: '/orders/v0/orders',
            method: 'GET',
            query: {
                CreatedAfter: date.toISOString(),
                MarketplaceIds: MACKETPLACEID
            }
        });
        orderList.push(result.Orders);

        while('NextToken' in result){
            if(result.NextToken !== ''){
                console.log('Has NextToken');
                result = await sellingPartner.callAPI({
                    api_path: '/orders/v0/orders',
                    method: 'GET',
                    query: {
                        CreatedAfter: date.toISOString(),
                        MarketplaceIds: MACKETPLACEID,
                        NextToken: result.NextToken
                    }
                });
                orderList.push(result.Orders);
            }
            else{
                break;
            }
        }
        console.log(`Get number of all data: ${orderList.length}`);

        let newDataList = [];
        for(let order of orderList){
            let data = await Data.findOne({email: user.email}).exec();
            let findData = data.data_arr.find(d => d.orderId === order.orderId);
            if(findData !== undefined){
                /* Need update the data */
                newDataList.push({
                    orderId: findData.AmazonOrderId,
                    purchaseDate: findData.purchaseDate,
                    orderStatus: order.OrderStatus,
                    shippedDate: findData.shippedDate,
                    buyerEmail: findData.buyerEmail,
                    buyerName: findData.buyerName,
                    itemName: findData.itemName,
                    isSent: findData.isSent,
                    unSend: findData.unSend,
                    sendTarget: findData.sendTarget,
                    condition: findData.condition,
                    subCondition: findData.subCondition,
                    fullfillment: findData.fullfillment
                });
                
            }
            else{
                /* New data */
                try{
                    /* Get buyer email */
                    let result2 = await sellingPartner.callAPI({
                        api_path: `/orders/v0/orders/${order.AmazonOrderId}/buyerInfo`,
                        method: 'GET',
                        options: {
                            raw_result: true
                        }
                    });
                    if(Number(result2.statusCode) !== 200){
                        console.log('API failed: buyerInfo');
                        throw (order.AmazonOrderId + ' ' + result2.body);
                    }
                    let buyerEmail =''
                    if(JSON.parse(result2.body).payload.BuyerEmail !== undefined){
                        buyerEmail = JSON.parse(result2.body).payload.BuyerEmail;
                    }
                    console.log(buyerEmail);

                    /* Get item name */
                    let result3 = await sellingPartner.callAPI({
                        api_path: `/orders/v0/orders/${order.AmazonOrderId}/orderItems`,
                        method: 'GET',
                        options: {
                            raw_result: true
                        }
                    });
                    if(Number(result3.statusCode) !== 200){
                        console.log('API failed: orderItems');
                        throw (order.AmazonOrderId + ' ' + result3.body);
                    }
                    result3 = JSON.parse(result3.body).payload.OrderItems[0];

                    newDataList.push({
                        orderId: order.AmazonOrderId,
                        purchaseDate: new Date(order.PurchaseDate),
                        orderStatus: order.OrderStatus,
                        shippedDate: null,
                        buyerEmail: buyerEmail,
                        buyerName: 'ご購入者', // Cannot get buyerName because of PII in Amazon
                        itemName: result3.Title,
                        isSent: false,
                        unSend: false,
                        sendTarget: false,
                        condition: result3.ConditionId,
                        subCondition: result3.ConditionSubtypeId,
                        fullfillment: order.FulfillmentChannel
                    });

                    let rate = result2.headers['x-amzn-ratelimit-limit'];
                    rate = rate < result3.headers['x-amzn-ratelimit-limit'] ? rate : result3.headers['x-amzn-ratelimit-limit'];
                    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                    await _sleep((1 / Number(rate)) * 1000);
                }
                catch(error){
                    log(error);
                }
            }

            /* Save to DB */
            await Data.findOneAndUpdate({email: user.email}, {
                data_arr: newDataList
            },{
                overwrite: true,
                upsert: true
            }).exec();
            log('Exit dataUpdate()');
        }

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

async function configSet(config){

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


