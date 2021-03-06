let mongoose = require('mongoose');
const sendgrid = require('@sendgrid/mail');
//let fs = require('fs');
let SellingPartnerAPI = require('amazon-sp-api');
const { exit } = require('process');
let handlebars = require('handlebars');
const schedule = require('node-schedule'); 
require('dotenv').config();

console.log('Start the scheduler program');

mongoose.connect(
    "mongodb://localhost:27017/rakucomeDb?authSource=admin",
    {
        useNewUrlParser: true,
        user: "admin",
        pass: process.env.DB_ADMINPW
    }
);

let db = mongoose.connection;
db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose!");
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

/* Reset every time for saving storage */
/*
console.log('Create log file');
fs.writeFile(process.env.LOGFILE_PATH, '', error => {
    if(error){
        console.log('Write file failed. Abort');
        exit(1);
    }
});*/

let User = require('./models/user');
let Config = require('./models/config');
let Data = require('./models/data');
let Mail = require('./models/mail');

main();

process.on('SIGINT', function () { 
    schedule.gracefulShutdown().then(() => {
        console.log('\nExit');
        process.exit(0);
    })
});

async function main() {

    /* Enable job for send email per 15 min as another thread */
    schedule.scheduleJob('*/15 * * * *', function(){
        sendEmailJob();
    });

    /* Save log for a week */
    /**
     * TODO: Set date for saving log
     * rule.dayOfWeek = 3; => Keep triger among Wednesday
     * When set two job, the first job disappear
     */
    /*
    let rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = 3; 
    schedule.scheduleJob(rule, function() {
        resetLogFile(fs);
    });*/

    while(1){

        /* Set interval 60s for amz rate restrict */
        const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await _sleep(10000);
        log('Active while');

        try{
            let users = await User.find({}).exec();
            for(let user of users){
                let config = await Config.findOne({email: user.email}).exec();
                await dataUpdate(user, config);
            }
        }
        catch(error){
            log(error);
        }
    }
}

async function dataUpdate(user, config) {
    log('Enter in dataUpdate()');
    log(`[${user.email}] config: ${config}`);
    let sellingPartner = new SellingPartnerAPI({
        region: 'fe',
        //access_token: user.access_token,
        refresh_token: user.refresh_token,
        credentials: {
            SELLING_PARTNER_APP_CLIENT_ID: process.env.SELLING_PARTNER_APP_CLIENT_ID,
            SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SELLING_PARTNER_APP_CLIENT_SECRET,
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
            AWS_SELLING_PARTNER_ROLE: process.env.AWS_SELLING_PARTNER_ROLE
        },
        options: {
            auto_request_throttled: false  // Catch rate restrict
        }
    });

    let startTime = Date.now();
    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    
    /**
     * How dulation is decided?
     * For test, set 1 month.
     * Considering to dulation of Config, it will be 2 month?
     */

    date = new Date(date.setMonth((date.getMonth() + 1 - 2)));
    log(`Create after: ${date.toString()}`);
    let orderList = [];
    try {
        let result = await sellingPartner.callAPI({
            api_path: '/orders/v0/orders',
            method: 'GET',
            query: {
                CreatedAfter: date.toISOString(),
                MarketplaceIds: process.env.MACKETPLACEID,
            },
            options: {
                raw_result: true
            }
        });
        const limit = result.headers['x-amzn-ratelimit-limit'];
        result = JSON.parse(result.body).payload;
        //log(result);
        for(let order of result.Orders){
            orderList.push(order);
        }

        while('NextToken' in result){
            if(result.NextToken !== ''){
                log('Has NextToken');
                log(`[/orders/v0/orders] Wait ${(1 / Number(limit)) * 1000} ms...`);
                const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                await _sleep((1 / Number(limit)) * 1000);

                /* Refresh credential role if spent 1 hour */
                if((Date.now() - startTime) >= (60 * 60 * 1000)){
                    await sellingPartner.refreshAccessToken();
                    await sellingPartner.refreshRoleCredentials();
                    log('Refresh token and credential role');
                    startTime = Date.now();
                }
                result = await sellingPartner.callAPI({
                    api_path: '/orders/v0/orders',
                    method: 'GET',
                    query: {
                        CreatedAfter: date.toISOString(),
                        MarketplaceIds: process.env.MACKETPLACEID,
                        NextToken: result.NextToken
                    }
                });
                //log(result);
                for(let order of result.Orders){
                    orderList.push(order);
                }
            }
            else{
                break;
            }
        }
        log(`Get number of all data: ${orderList.length}`);

        let newDataList = [];
        for(let order of orderList){
            let data = await Data.findOne({email: user.email}).exec();
            let findData = undefined;
            if(data.data_arr !== null){
                findData = data.data_arr.find(d => d.orderId === order.AmazonOrderId);
            }

            if(findData !== undefined){
                /* Update the data */
                if(findData.shippedDate === null && (order.OrderStatus === 'Shipped' || order.OrderStatus === 'InvoiceUnconfirmed')){
                    findData.shippedDate = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
                    /* Get each information because it became 'Shipped' status */
                    log(`[${findData.orderId}] Detect order change to Shipped etc`);
                    try{
                        /* Get buyer email */
                        /* Refresh credential role if spent 1 hour */
                        if((Date.now() - startTime) >= (60 * 60 * 1000)){
                            await sellingPartner.refreshAccessToken();
                            await sellingPartner.refreshRoleCredentials();
                            log('Refresh token and credential role');
                            startTime = Date.now();
                        }
                        let result2 = await sellingPartner.callAPI({
                            api_path: `/orders/v0/orders/${order.AmazonOrderId}/buyerInfo`,
                            method: 'GET',
                            options: {
                                raw_result: true
                            }
                        });
                        if(Number(result2.statusCode) !== 200){
                            log('API failed: buyerInfo');
                            throw (order.AmazonOrderId + ' ' + result2.body);
                        }
                        if(JSON.parse(result2.body).payload.BuyerEmail !== undefined){
                            findData.buyerEmail = JSON.parse(result2.body).payload.BuyerEmail;
                        }
                        log(`Get buyerEmail: ${findData.buyerEmail}`);
    
                        /* Get item name */
                        /* Refresh credential role if spent 1 hour */
                        if((Date.now() - startTime) >= (60 * 60 * 1000)){
                            await sellingPartner.refreshAccessToken();
                            await sellingPartner.refreshRoleCredentials();
                            log('Refresh token and credential role');
                            startTime = Date.now();
                        }
                        let result3 = await sellingPartner.callAPI({
                            api_path: `/orders/v0/orders/${order.AmazonOrderId}/orderItems`,
                            method: 'GET',
                            options: {
                                raw_result: true
                            }
                        });
                        if(Number(result3.statusCode) !== 200){
                            log('API failed: orderItems');
                            throw (order.AmazonOrderId + ' ' + result3.body);
                        }
                        let rate = result3.headers['x-amzn-ratelimit-limit'];
                        result3 = JSON.parse(result3.body).payload.OrderItems[0];
    
                        //console.log(result3);
                        if('Title' in result3){
                            findData.itemName = result3.Title;
                        }

                        findData.condition = 'New'; // => Set New as default because kinds of product to eat has no ConditionId in Iteminfo 
                        if('ConditionId' in result3){
                            findData.condition = result3.ConditionId;
                        }
                        if('ConditionSubtypeId' in result3){
                            findData.subCondition = result3.ConditionSubtypeId;
                        }    
                        
                        rate = rate < result2.headers['x-amzn-ratelimit-limit'] ? rate : result2.headers['x-amzn-ratelimit-limit'];
                        log(`[/orders/v0/orders buyerInfo or itemInfo] Wait ${(1 / Number(rate)) * 1000} ms...`);
                        const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                        await _sleep((1 / Number(rate)) * 1000);
                    }
                    catch(error){
                        log(error);
                    }
                }

                findData.sendTarget = getSendTarget({
                    condition: findData.condition,
                    subCondition: findData.subCondition,
                    fullfillment: findData.fullfillment
                }, config);

                newDataList.push({
                    orderId: findData.orderId,
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
                /* When it is already something like Shipped for some reason, unSend will be true */
                let unSend = false;
                let shippedDate = null;
                let buyerEmail ='';
                let conditionId = '';
                let conditionSubId = '';
                let itemName = '';
                let sendTarget = false;
                if(order.OrderStatus === 'Shipped' || order.OrderStatus === 'InvoiceUnconfirmed'){
                    shippedDate = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
                    if(!(shippedDate.getTime() - new Date(order.PurchaseDate).getTime() <= 15 * 60 * 60 * 1000)){
                        /* Order out range */
                        unSend = true;
                    }
                    else{
                        /* Order in range */
                        log(`[${order.AmazonOrderId}] Detect order to be already Shipped etc`);
                        try{
                            /* Get buyer email */
                            /* Refresh credential role if spent 1 hour */
                            if((Date.now() - startTime) >= (60 * 60 * 1000)){
                                await sellingPartner.refreshAccessToken();
                                await sellingPartner.refreshRoleCredentials();
                                log('Refresh token and credential role');
                                startTime = Date.now();
                            }
                            let result2 = await sellingPartner.callAPI({
                                api_path: `/orders/v0/orders/${order.AmazonOrderId}/buyerInfo`,
                                method: 'GET',
                                options: {
                                    raw_result: true
                                }
                            });
                            if(Number(result2.statusCode) !== 200){
                                log('API failed: buyerInfo');
                                throw (order.AmazonOrderId + ' ' + result2.body);
                            }
                            if(JSON.parse(result2.body).payload.BuyerEmail !== undefined){
                                buyerEmail = JSON.parse(result2.body).payload.BuyerEmail;
                            }
                            log(`Get buyerEmail: ${buyerEmail}`);
        
                            /* Get item name */
                            /* Refresh credential role if spent 1 hour */
                            if((Date.now() - startTime) >= (60 * 60 * 1000)){
                                await sellingPartner.refreshAccessToken();
                                await sellingPartner.refreshRoleCredentials();
                                log('Refresh token and credential role');
                                startTime = Date.now();
                            }
                            let result3 = await sellingPartner.callAPI({
                                api_path: `/orders/v0/orders/${order.AmazonOrderId}/orderItems`,
                                method: 'GET',
                                options: {
                                    raw_result: true
                                }
                            });
                            if(Number(result3.statusCode) !== 200){
                                log('API failed: orderItems');
                                throw (order.AmazonOrderId + ' ' + result3.body);
                            }
                            let rate = result3.headers['x-amzn-ratelimit-limit'];
                            result3 = JSON.parse(result3.body).payload.OrderItems[0];
                            
                            if('Title' in result3){
                                itemName = result3.Title;
                            }
        
                            //console.log(result3);
                            conditionId = 'New'; // => Set New as default because kinds of product to eat has no ConditionId in Iteminfo 
                            if('ConditionId' in result3){
                                conditionId = result3.ConditionId;
                            }
                            if('ConditionSubtypeId' in result3){
                                conditionSubId = result3.ConditionSubtypeId;
                            }

                            rate = rate < result2.headers['x-amzn-ratelimit-limit'] ? rate : result2.headers['x-amzn-ratelimit-limit'];
                            log(`[/orders/v0/orders buyerInfo or itemInfo] Wait ${(1 / Number(rate)) * 1000} ms...`);
                            const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                            await _sleep((1 / Number(rate)) * 1000);
                        }
                        catch(error){
                            log(error);
                        }

                    }
                }

                sendTarget = getSendTarget({
                    condition: conditionId,
                    subCondition: conditionSubId,
                    fullfillment: order.FulfillmentChannel
                }, config);

                newDataList.push({
                    orderId: order.AmazonOrderId,
                    purchaseDate: new Date(order.PurchaseDate),
                    orderStatus: order.OrderStatus,
                    shippedDate: shippedDate,
                    buyerEmail: buyerEmail,
                    buyerName: '????????????', // Cannot get buyerName because of PII in Amazon
                    itemName: itemName,
                    isSent: false,
                    unSend: unSend,
                    sendTarget: sendTarget,
                    condition: conditionId,
                    subCondition: conditionSubId,
                    fullfillment: order.FulfillmentChannel
                });
            }
        }
        /* Save to DB */
        
        await Data.findOneAndUpdate({email: user.email}, {
            $set: {
                data_arr: newDataList
            }
        },{
            overwrite: true
        }).exec();
        //log(newDataList);
        log('Save update data');
    }
    catch(error){
        log(error);
    }
    log('Exit dataUpdate()');
}

async function sendEmail(user, config){
    log('Enter in sendEmail()');
    if(!config.status){
        return;
    }
    if(checkRestrictDulation(config.from, config.to)){
        log('Now is in the restricted dulation');
        return;
    }
    
    try{
        let data = await Data.findOne({email: user.email}).exec();
        if(data.data_arr === null){
            return;
        }
        const sendList = data.data_arr.filter(d => 
            d.isSent === false && 
            d.unSend === false && 
            d.sendTarget === true &&
            d.shippedDate !== null &&
            (d.orderStatus === 'Shipped' || d.orderStatus === 'InvoiceUnconfirmed'));
        //log('SendList: ' + sendList);
        for(let sendData of sendList){            
            const now = Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000);
            const time = sendData.shippedDate.getTime() + (config.dulation * 24 * 60 * 60 * 1000);
            /* Check dulation from now to before 1 day */
            log(`[${sendData.orderId}] ` + 'Check time for sending: ' + `${new Date(now - (24 * 60 * 60 * 1000)).toDateString()} ${new Date(now - (24 * 60 * 60 * 1000)).toTimeString()} < ${new Date(time).toDateString()} ${new Date(time).toTimeString()} <= ${new Date(now).toDateString()} ${new Date(now).toTimeString()}`);
            if(now - (24 * 60 * 60 * 1000) < time && time <= now){
                let result = await Mail.findOne({email: user.email}).exec();
                const mailValue = {
                    name: sendData.buyerName,
                    orderId: sendData.orderId,
                    itemName: sendData.itemName
                }
                let templete = handlebars.compile(result.html);
                let html = templete(mailValue);
                let templeteSub = handlebars.compile(result.subject);
                let subject = templeteSub(mailValue);
                await sendgrid.send({
                    to: sendData.buyerEmail,
                    from: process.env.EMAILFROM,
                    subject: subject,
                    html: html
                });
                const index = data.data_arr.findIndex(d => d.orderId === sendData.orderId);
                data.data_arr[index].isSent = true;
                log(`[${sendData.orderId}] ` + 'Successed for sending email to: ' + sendData.buyerEmail);
            }
        }
        await Data.updateOne({email: user.email}, data).exec();
        log('Reflect sending status');
    }
    catch(error){
        log(error);
    }
    
    log('Exit sendEmail()');
}

async function sendEmailJob(){
    log('Active sendEMailJob()');
    try{
        let users = await User.find({}).exec();
        for(let user of users){
            let config = await Config.findOne({email: user.email}).exec();
            await sendEmail(user, config);
        }
    }
    catch(error){
        log(error);
    }
}

function getSendTarget(data, config){
    if((data.fullfillment === 'AFN' && config.fba) || (data.fullfillment === 'MFN' && config.mba)){
        if((data.condition === 'New' && config.new) || 
            (data.condition === 'Used' && 
                (
                    (data.subCondition === 'Mint' && config.mint) ||
                    (data.subCondition === 'Very Good' && config.verygood) ||
                    (data.subCondition === 'Good' && config.good) ||
                    (data.subCondition === 'Acceptable' && config.acceptable)
                )
            ))
        {
            return true;
        }
    } 
    return false;
}

/* start end format: '12:34' */
function checkRestrictDulation(start, end){
    log('Check dulation: ' + `From ${start} to ${end}`);
    const now = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    const startDate = new Date(Date.parse(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${start}`));
    const endDate = new Date(Date.parse(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${end}`));
    log('Compare: ' + `start => ${startDate.toString()} end => ${endDate.toString()} now => ${now.toString()}`);
    if(startDate.getHours() < endDate.getHours() || 
        (startDate.getHours() === endDate.getHours() && startDate.getMinutes() < endDate.getMinutes())){
        if(startDate.getTime() <= now.getTime() && now.getTime() < endDate.getTime()){

            return true;
        }
    }
    else if(startDate.getHours() > endDate.getHours() ||
        (startDate.getHours() === endDate.getHours() && startDate.getMinutes() > endDate.getMinutes())){
        if(endDate.getTime() > now.getTime() || now.getTime() >= startDate.getTime()){
            return true;
        }
    }
    return false;
}

function log(str) {
    console.log(str);
    /*
    const now = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    fs.appendFile(process.env.LOGFILE_PATH, `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}: ` + str + '\n', error => {
        if(error){
            console.log('Append file failed. Abort');
            exit(1);
        }
    });*/
}

function resetLogFile(fs) {
    console.log('Reset log file');
    fs.writeFile(process.env.LOGFILE_PATH, '', error => {
        if(error){
            console.log('Write file failed. Abort');
            exit(1);
        }
    });
}

