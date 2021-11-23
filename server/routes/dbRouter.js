let express = require('express');
let dbRouter = express.Router();
let User = require('../models/user');
let bcrypt = require('bcrypt');
const passport = require('passport');
const saltRounds = 10;


dbRouter.post('/', function(req, res, next){
    bcrypt.hash(req.body['password'], saltRounds, function(error, hash){
        if(error) next(error);
        console.log(req.body);
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

module.exports = dbRouter;