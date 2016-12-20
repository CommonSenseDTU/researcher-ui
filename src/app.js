import server from './server';

exports.handler = function(event, context) {
  server();
}

// Local direct test case
if (!module.parent) {
  exports.handler(
    {},
    { done: (err, x) => 
      console.log(`${err}, ${x}`) 
    }
  );
}

