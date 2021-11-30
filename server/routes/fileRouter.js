let express = require('express');
let fileRouter = express.Router();
let cloudinary = require('cloudinary').v2;

fileRouter.post('/upload', function(res, req, next){
    console.log(req.body);
    /*
    cloudinary.uploader.upload(req.body, function(error, result){
        if(error) {
            console.log(error);
            next(error);
        }
        console.log(result);
        res.json(result['secure_url']);
    });
    */
   cloudinary.uploader.upload(req.body)
   .then(result => {
    console.log(result);
    res.json(result.secure_url);
   })
   .catch(error => {
       if(error){
           console.log(error);
           next(error);
        }
    });
});

module.exports = fileRouter;