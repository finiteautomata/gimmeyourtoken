# Gimme your token

App just to get the token of our friends :-)

Based on: https://gist.github.com/drikin/3030992

## Getting a Twitter App

Go to https://developer.twitter.com/en/apps and create an app.

# How to do oauth with twitter and have a token you can do requests on their behalf

__

* Clone config.sample.js into config.js and put there the consumer key and secret from the app page.
* Check the Permissions tabs so you request the right permissions (you probably just want read-only).
* Set also the callback url. You can use localhost for testing so it could be http://localhost:3456/sessions/callback and you can add another different one in prod. When you start the oauth process you need to pass it the callback url but in Twitter (as in most services) you need to add the callback url to the whitelist.
* You can start the sample app with node server.js and you can try to oauth with your app. in the console logs you should be able to see the oauth request token and service and use that to make request on behalf of a user like this sample `account/verify_credentials.json` call.

## Starting server

```
PORT=3456 node server.js
```
