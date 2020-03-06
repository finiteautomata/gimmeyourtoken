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
var fs = require('fs');
var logger = require('morgan');
var body_parser = require('body-parser');
var method_override = require('method-override');
var session = require('express-session');
var error_handler = require('errorhandler');

var app = express();
// all environments
app.set('port', config.PORT || 80);

app.use(logger("default"));
app.use(body_parser.urlencoded({
  extended: true
}));
app.use(body_parser.json());
app.use(method_override());
app.use(session({  secret: config.EXPRESS_SESSION_SECRET }));
app.use(error_handler({ dumpExceptions: true, showStack: true }));

var _twitterConsumerKey = config.TWITTER_CONSUMER_KEY;
var _twitterConsumerSecret = config.TWITTER_CONSUMER_SECRET;
console.log("_twitterConsumerKey: %s and _twitterConsumerSecret %s", _twitterConsumerKey, _twitterConsumerSecret);

function consumer() {
  var callbackUrl = config.HOSTPATH+'/sessions/callback';
  console.log("callbackUrl>>"+callbackUrl);

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
  console.log("jajajaj");
  res.sendfile('views/index.html');
});

app.get('/sessions/connect', function(req, res){
  consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){ //callback with request token
    if (error) {
      res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
    } else {
      console.log("results>>"+sys.inspect(results));
      console.log("oauthToken>>"+oauthToken);
      console.log("oauthTokenSecret>>"+oauthTokenSecret);

      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://api.twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
    }
  });
});


app.get('/sessions/callback', function(req, res){
  console.log("oauthRequestToken >> "+req.session.oauthRequestToken);
  console.log("oauthRequestTokenSecret >> "+req.session.oauthRequestTokenSecret);
  console.log("oauth_verifier >> "+req.query.oauth_verifier);
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
            console.log("Access Token >> "+oauthAccessToken);
            console.log("Access Token Secret >> "+oauthAccessTokenSecret);
            req.session.twitterScreenName = data["screen_name"];
            req.session.twitterLocation = data["location"];
            fs.appendFile(
                'tokens.csv',
                req.session.twitterScreenName + "," + oauthAccessToken + "," + oauthAccessTokenSecret +"\n",
                (err) => {
                  if (err) throw err;
                  console.log("Saved token of "+req.session.twitterScreenName);
                }
            );
            res.send('You are signed in with Twitter screenName ' + req.session.twitterScreenName + ' and twitter thinks you are in '+ req.session.twitterLocation)
          }
        });
      }
    });
});


app.listen(parseInt(config.PORT || 80));
