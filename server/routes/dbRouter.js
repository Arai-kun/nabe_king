let express = require('express');
let dbRouter = express.Router();
let User = require('../models/user');
let Config = require('../models/config');
let Data = require('../models/data');
let Mail = require('../models/mail');
let MailDesign = require('../models/mailDesign');
let bcrypt = require('bcrypt');
const saltRounds = 10;
let request = require('request');
let crypto = require('crypto-js');

let data_arr = [];

dbRouter.post('/', function(req, res, next){
    bcrypt.hash(req.body['password'], saltRounds, function(error, hash){
        if(error) next(error);
        console.log(req.body);
        req.body['password'] = hash;
        User.create(req.body, error => {
            if(error) next(error);
            res.json({result: 'success'});
        });
    });
});

dbRouter.post('/exist', function(req, res, next){
    User.findOne({email: req.body['email']}, function(error, user){
        if(error) next(error);
        if(!user){
            res.json(false);
        }
        else{
            res.json(true);
        }
    })
});

dbRouter.get('/tokens', function(req, res, next){
    //console.log(req);
    User.findOne({email: req.user['email']}, function(error, user){
        if(error) next(error);
        if(user.seller_partner_id === "" || user.refresh_token === "" || user.access_token === ""){
            res.json(false);
        }
        else{
            res.json(true);
        }
    });
});

dbRouter.get('/init', function(req, res, next){
    let mail = req.user['email'];
    Config.create({
        email: mail,
        status: false,
        dulation: 0
    }, error => {
        if(error) next(error);
        // テスト用 -> 実際はここでデータを取らない
        User.findOne({email: req.user['email']}, (error, user) => {
            if(error) next(error);
            getOrders(user.access_token)
            .then(() => {
                Data.create({
                    email: mail,
                    data_arr: data_arr
                }, error => {
                    if(error) next(error);
                    Mail.create({
                        email: mail,
                        html: "",
                        subject: ""
                    }, error => {
                        if(error) next(error);
                        MailDesign.create({
                            email: mail,
                            design: ""
                        }, error => {
                            if(error) next(error);
                            res.json({result: 'success'});
                        });
                    });
                });
            })
            .catch(error =>{
                console.log(error);
                next(error);
            })
        });
    });
});

dbRouter.get('/config', function(req, res, next) {
    Config.findOne({email: req.user['email']}, (error, config) => {
        if(error) next(error);
        res.json(config);
    });
});

dbRouter.post('/config', function(req, res, next){
    Config.updateOne({email: req.user['email']}, {
        status: req.body['status'], 
        dulation: req.body['dulation']
    }, error => {
        if(error) next(error);
        res.json({result: 'success'});
    });
});

dbRouter.get('/data', function(req, res, next){
    Data.findOne({email: req.user['email']}, (error, data) => {
        if(error) next(error);
        res.json(data);
    })
})

dbRouter.post('/data', function(req, res, next){
    Data.updateOne({email: req.user['email']}, {
        data_arr: req.body['data_arr']
    }, error => {
        if(error) next(error);
        res.json({result: 'success'});
    });
});

dbRouter.get('/email', function(req, res, next){
    res.json({
        email: req.user['email'],
        password: "",
        seller_partner_id: "",
        refresh_token: "",
        access_token: ""
    });
});

dbRouter.get('/mailDesgin', function(req, res, next){
    MailDesign.findOne({email: req.user['email']}, (error, data) => {
        if(error) next(error);
        res.json(data);
    });
});

dbRouter.post('/mailDesign', function(req, res, next){
    MailDesign.updateOne({email: req.user['email']}, {
        design: req.body
    }), error => {
        if(error) next(error);
        res.json({result: 'success'});
    }
});

dbRouter.post('/mail', function(req, res, next){
    Mail.updateOne({email: req.user['email']}, {
        html: req.body['html'],
        subject: req.body['subject']
    }, error => {
        if(error) next(error);
        res.json({result: 'success'});
    });
});

dbRouter.get('/subject', function(req, res, next){
    Mail.findOne({email: req.user['email']}, (error, data) => {
        if(error) next(error);
        res.json({html: "", subject: data['subject']});
    })
})


async function getOrders(token){
    const apiKey = 'AKIAWECJIQCPBTLTQXVD';
    const serKey = 'yskXjbFw7cT1mraGypAoSe1f2Ck9RKO4ATpfzLQW';
    const region = 'us-west-2';
    const service = 'execute-api'
    const now = new Date(); //new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }));
    const date = `${now.getFullYear()}${('0' + (now.getMonth() + 1)).slice(-2)}${('0' + now.getDate()).slice(-2)}T${('0' + now.getHours()).slice(-2)}${('0' + now.getMinutes()).slice(-2)}${('0' + now.getSeconds()).slice(-2)}Z`;
    const dateStamp = `${now.getFullYear()}${('0' + (now.getMonth() + 1)).slice(-2)}${('0' + now.getDate()).slice(-2)}`;
    let kDate = crypto.HmacSHA256(dateStamp, 'AWS4' + serKey);
    let kRegion = crypto.HmacSHA256(region, kDate);
    let kService = crypto.HmacSHA256(service, kRegion);
    let kSigning = crypto.HmacSHA256('aws4_request', kService);
    const options = {
        method: 'GET',
        url: 'https://sandbox.sellingpartnerapi-fe.amazon.com/orders/v0/orders?CreatedAfter=TEST_CASE_200&MarketplaceIds=ATVPDKIKX0DER',
        headers: {
           'x-amz-access-token': token,
           'x-amz-date': date,
           'Authorization': `AWS4-HMAC-SHA256 Credential=${apiKey}/${dateStamp}/${region}/${service}/aws4_request,SignedHeaders=host;x-amz-date;x-amz-access-token,Signature=${kSigning}`
        }
    }
    console.log(options);
    await new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if(error) reject(error);
            console.log(body);
            let orders = [{}];
            try{
                orders = body['Orders'];
                for(let i = 0; i < orders.length; i++){
                    data_arr.push({
                        orderId: orders[i]['AmazonOrderId'],
                        purchaseDate: new Date(orders[i]['PurchaseDate']),
                        orderStatus: orders[i]['OrderStatus'],
                        buyerEmail: "",
                        buyerName: "",
                        itemName: "",
                        quantityOrdered: 0,
                        isSent: false,
                        unSend: false
                    })
                }
                resolve();
            }
            catch(e){
                console.log(e);
                reject(e);
            }
        });
    });
}

module.exports = dbRouter;