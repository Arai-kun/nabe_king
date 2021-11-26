let express = require('express');
let dbRouter = express.Router();
let User = require('../models/user');
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
    })
});

module.exports = dbRouter;