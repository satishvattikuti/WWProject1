const TwitterPackage = require('twitter');

const  secret = {
  consumer_key: 'izFLOhFIKv8ufBKO9lqksgagM',
  consumer_secret: 'Q6MxE8Hnwroz4fx3hQbBwfASmh1dfVWR11sGPmXb8MtILAFqQl',
  access_token_key: '3688784633-eaiMlPQTgCmaNLJHV08kyd8FLyPNeKft3Ezd8rG',
  access_token_secret: 'GNXPBWjnTJ3ooHd2yUA9fMj8uRJN7mQjTPzFeCuVWhQri'
}


const Twitter = new TwitterPackage(secret);

Twitter.stream('statuses/filter', {track:'#Wonderla'}, function(stream) {
  console.log('listening');
  stream.on('data', function(tweet) {
    console.log(tweet.user.name);
    console.log(tweet.text);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});

