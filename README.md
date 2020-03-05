# Gimme your token

App just to get the token of our friends :-)

Based on: https://gist.github.com/drikin/3030992


## Getting a Twitter App

Go to https://developer.twitter.com/en/apps and create an app.

If you want to have a better understanding of the OAuth process, go to [Tweepy docs](http://docs.tweepy.org/en/latest/auth_tutorial.html) which explain it well.

Set also the callback url. You can use localhost for testing so it could be http://localhost:3456/sessions/callback and you can add another different one in prod. When you start the oauth process you need to pass it the callback url but in Twitter (as in most services) you need to add the callback url to the whitelist.

## Instructions

1. Create config with keys

Copy `config.sample.js` to `config.js` and set the consumer key and secret.

2. Copy `tokens.csv.sample` to `tokens.csv`

This will be our "database"

3. Start server

Run

```
node server.js
```

### Tweepy Example: searching using somebody else's keys

```python
# consumer_key, consumer_secret are the key and secret of the app
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)

# user_access_token and user_access_secret are those that we save in tokens.csv
auth.set_access_token(user_access_token, user_access_secret)

api = tweepy.API(auth)

print(api.me().screen_name)
```
