let express = require('express');
let dbRouter = express.Router();
let User = require('../models/user');
let Config = require('../models/config');
let Data = require('../models/data');
let Mail = require('../models/mail');
let MailDesign = require('../models/mailDesign');
let bcrypt = require('bcrypt');
const saltRounds = 10;

dbRouter.post('/', function(req, res, next){
    bcrypt.hash(req.body['password'], saltRounds, function(error, hash){
        if(error) next(error);
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
        dulation: 0,
        from: '',
        to: '',
        fba: true,
        mba: false,
        new: true,
        mint: false,
        verygood: false,
        good: false,
        acceptable: false
    }, error => {
        if(error) next(error);
        Data.create({
            email: mail,
            data_arr: null
        }, error => {
            if(error) next(error);
            Mail.findOne({email: 'metadata'}, (error, initMail) => {
                if(error) next(error);
                Mail.create({
                    email: mail,
                    html: initMail['html'],
                    subject: initMail['subject']
                }, error => {
                    if(error) next(error);
                    MailDesign.findOne({email: 'metadata'}, (error, initMailDesign) => {
                        if(error) next(error);
                        MailDesign.create({
                            email: mail,
                            design: initMailDesign['design']
                        }, error => {
                            if(error) next(error);
                            res.json({result: 'success'});
                        });
                    });
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
        dulation: req.body['dulation'],
        from: req.body['from'],
        to: req.body['to'],
        fba: req.body['fba'],
        mba: req.body['mba'],
        new: req.body['new'],
        mint: req.body['mint'],
        verygood: req.body['verygood'],
        good: req.body['good'],
        acceptable: req.body['acceptable']
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

dbRouter.get('/mailDesign', function(req, res, next){
    MailDesign.findOne({email: req.user['email']}, (error, data) => {
        if(error) next(error);
        res.json(data);
    });
});

dbRouter.post('/mailDesign', function(req, res, next){
    MailDesign.updateOne({email: req.user['email']}, {
        design: JSON.stringify(req.body['design'])
    }, error => {
        if(error) next(error);
        res.json({result: 'success'});
    });
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
    });
});

dbRouter.get('/delete', function(req, res, next){
    const mail = req.user['email'];
    MailDesign.deleteOne({email: mail}, error => {
        if(error) next(error);
        Mail.deleteOne({email: mail}, error => {
            if(error) next(error);
            Data.deleteOne({email: mail}, error => {
                if(error) next(error);
                Config.deleteOne({email: mail}, error => {
                    if(error) next(error);
                    User.deleteOne({email: mail}, error => {
                        if(error) next(error);
                        res.json(true);
                    });
                });
            });
        });
    });
});


module.exports = dbRouter;