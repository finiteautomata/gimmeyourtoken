/*
 * example OAuth and OAuth2 client which works with express v3 framework
 *
 */

var express = require('express')
  , path = require('path');

var config = require('./config.js');
console.log(config.PORT);

var sys = require('util');
var oauth = require('oauth');


var app = express();

// all environments
app.configure(function(){
  app.set('port', config.PORT || 80);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({  secret: config.EXPRESS_SESSION_SECRET }));
  app.use(function(req, res, next){
      res.locals.user = req.session.user;
      next();
    });
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

var _twitterConsumerKey = config.TWITTER_CONSUMER_KEY;
var _twitterConsumerSecret = config.TWITTER_CONSUMER_SECRET;
console.log("_twitterConsumerKey: %s and _twitterConsumerSecret %s", _twitterConsumerKey, _twitterConsumerSecret);

function consumer() {
  var callbackUrl = config.HOSTPATH+'/sessions/callback';
  sys.puts("callbackUrl>>"+callbackUrl);

  return new oauth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
     _twitterConsumerKey,
     _twitterConsumerSecret,
     "1.0A",
     callbackUrl,
     "HMAC-SHA1"
   );
}

app.get('/', function(req, res){
  res.sendfile('views/index.html');
});

app.get('/sessions/connect', function(req, res){
  consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){ //callback with request token
    if (error) {
      res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
    } else {
      sys.puts("results>>"+sys.inspect(results));
      sys.puts("oauthToken>>"+oauthToken);
      sys.puts("oauthTokenSecret>>"+oauthTokenSecret);

      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://api.twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
    }
  });
});


app.get('/sessions/callback', function(req, res){
  sys.puts("oauthRequestToken>>"+req.session.oauthRequestToken);
  sys.puts("oauthRequestTokenSecret>>"+req.session.oauthRequestTokenSecret);
  sys.puts("oauth_verifier>>"+req.query.oauth_verifier);
  consumer().getOAuthAccessToken(
    req.session.oauthRequestToken,
    req.session.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    function(error, oauthAccessToken, oauthAccessTokenSecret, results) { //callback when access_token is ready
      if (error) {
        res.send("Error getting OAuth access token : " + sys.inspect(error), 500);
      } else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        consumer().get("https://api.twitter.com/1.1/account/verify_credentials.json",
                        req.session.oauthAccessToken,
                        req.session.oauthAccessTokenSecret,
                        function (error, data, response) {  //callback when the data is ready
          if (error) {
            res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
          } else {
            data = JSON.parse(data);
            req.session.twitterScreenName = data["screen_name"];
            req.session.twitterLocaltion = data["location"];
            res.send('You are signed in with Twitter screenName ' + req.session.twitterScreenName + ' and twitter thinks you are in '+ req.session.twitterLocaltion)
          }
        });
      }
    });
});


app.listen(parseInt(config.PORT || 80));