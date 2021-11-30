let express = require('express');
let fileRouter = express.Router();
let cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'du1gt2vtq', 
    api_key: '453981237853244', 
    api_secret: 'YrpNlSJPjbHajBsQSUL4AcYNtVY',
    secure: true
});

fileRouter.post('/upload', function(res, req, next){
    cloudinary.uploader.upload(req.body, function(error, result){
        console.log(req.body);
        if(error) next(error);
        console.log(result);
        res.json(result['secure_url']);
    });
});

module.exports = fileRouter;