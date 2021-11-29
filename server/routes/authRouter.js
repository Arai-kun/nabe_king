let express = require('express');
let authRouter = express.Router();
const passport = require('passport');
let request = require('request');
let User = require('../models/user');

let tokens = { access_token: "", refresh_token: "" };

/* POST Login. */
authRouter.post('/login', passport.authenticate('local', { session: true }), function(req, res) {
  res.json(true);
});

/* GET isAuthenticated */
authRouter.get('/check', function(req, res, next){
  //console.log('Call GET /auth')
  //if(error) next(error);
  if(req.isAuthenticated()){
    res.json(true);
  }
  else
  {
    res.json(false);
  }
});

authRouter.get('/logout', function(req, res, next){
  //if(error) next(error);
  req.logout();
  res.json({result: 'Logout Success'});
});

authRouter.post('/exchange', function(req, res, next){
    /**
     * ユースケース: 既に他アカウントにamazonが紐づいている時に、このアカウントに同じamazonを紐づけようとする
     * seller_partner_idが既存か確認。以下、ない場合
     */
    getTokenFromCode(req.body['code'])
    .then(() => {
        User.updateOne({email: req.user['email']}, // req.user.email => req.user['email']
            {
                seller_partner_id: req.body['id'], 
                refresh_token: tokens.refresh_token, 
                access_token: tokens.access_token
            }, function(error){
                if(error) next(error);
                res.json({result: 'success'});
            });

    })
    .catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

async function getTokenFromCode(code){
    const options = {
        method: 'POST',
        url: encodeURI('https://api.amazon.com/auth/o2/token'),
        headers:{
           'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: `grant_type=authorization_code&code=${code}&client_id=amzn1.application-oa2-client.d63eca24c26c4108af41e95cd75e9449&client_secret=7192fe26b508bc44d21a4f595e4d4b8afb44ad142d5b2cb56a2149db8070739a&redirect_uri=https://enginestarter.nl/auth`
    }
    console.log(options);
    await new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if(error) reject(error);
            console.log(body);
            tokens.access_token = JSON.parse(body)['access_token'];
            tokens.refresh_token = JSON.parse(body)['refresh_token'];
            resolve();
        });
    });
}

module.exports = authRouter;
