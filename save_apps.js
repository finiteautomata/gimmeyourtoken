/*
 *
 * Save apps for use in Tweepyrate
 *
 */

const config = require('./config.js');
const csv = require('csv-parser')
const fs = require('fs')

var results = [];

fs.createReadStream('tokens.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    results.forEach( function(key){
      key.consumer_key = config.TWITTER_CONSUMER_KEY;
      key.consumer_secret = config.TWITTER_CONSUMER_SECRET;
    });
    let data = JSON.stringify(results, null, 2);
    fs.writeFileSync('gyt-apps.json', data);
});
