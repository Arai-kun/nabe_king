let express = require('express');
let dbRouter = express.Router();
let User = require('../models/user');
let Config = require('../models/config');
let Data = require('../models/data');
let Mail = require('../models/mail');
let Unsend = require('../models/unsend');
let bcrypt = require('bcrypt');
const saltRounds = 10;


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
        Data.create({
            email: mail,
            data_arr: [{
                orderId: "",
                purchaseDate: new Date(new Date().toLocaleString({ timeZone: 'Asia/Tokyo' })),
                orderStatus: "",
                buyerEmail: "",
                buyerName: "",
                itemName: "",
                quantityOrdered: 0,
                isSent: false,
                unSend: false
            }]
        }, error => {
            if(error) next(error);
            Mail.create({
                email: mail,
                html: "<h1>メールテンプレート</h1>"
            }, error => {
                if(error) next(error);
                Unsend.create({
                    orderId: ""
                }, error => {
                    if(error) next(error);
                    res.json({result: 'success'});
                });
            });
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

/*
dbRouter.get('/unsend', function(req, res, next){
    Unsend.find((error, data) => {
        if(error) next(error);
        res.json(data);
    })
})
*/

module.exports = dbRouter;