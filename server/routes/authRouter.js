let express = require('express');
let authRouter = express.Router();
//const passport = require('passport');
let request = require('request');

/* POST Login. */
/*
authRouter.post('/login', passport.authenticate('local', { session: true }), function(req, res) {
  res.json(true);
});*/

/* GET isAuthenticated */
authRouter.get('/', function(req, res, next){
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
    getTokenFromCode(req.body)
    .then(data => res.json(data))
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
        body: `grant_type=authorization_code&code=${code}&client_id=amzn1.application-oa2-client.d63eca24c26c4108af41e95cd75e9449&client_secret=7192fe26b508bc44d21a4f595e4d4b8afb44ad142d5b2cb56a2149db8070739a`
    }
    await new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if(error) reject(error);
            console.log(body);
            resolve(JSON.parse(body));
        });
    });
}

module.exports = authRouter;
