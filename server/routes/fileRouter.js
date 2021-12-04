let express = require('express');
let fileRouter = express.Router();
let cloudinary = require('cloudinary').v2;
const sendgrid = require('@sendgrid/mail');

fileRouter.post('/upload', function(req, res, next){
    /*
    cloudinary.uploader.upload(req.body['data'], function(error, result){
        if(error) {
            console.log(error);
            next(error);
        }
        console.log(result);
        res.json(result.secure_url);
    });
    */
   cloudinary.uploader.upload(req.body['data'])
   .then(result => {
        //console.log(result);
        res.json(result.secure_url);
   })
   .catch(error => {
       if(error){
           //console.log(error);
           next(error);
        }
    });
});

module.exports = fileRouter;