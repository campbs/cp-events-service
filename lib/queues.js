//THis file hamdles/ runs the queue we created..
//We put all the emails in a Q rather than them sending straight away.

var async = require('async');
module.exports = function (options) {
  var seneca = this;

  //create new func
  //call s.act based on below

  var sendEmail = {};

  sendEmail['index'] = function(payload, cb){
    console.log("options.config")
    console.log(options)
      if (options.config && options.config.start) {
        seneca.act({role: 'kue-queue', cmd: payload.cmd, name: payload.name, msg: payload.msg }, cb);

      }
      else{
        //dont need name here..
        seneca.act({role: 'queue', cmd: payload.cmd, msg: payload.msg }, cb);
      }

    }

  if (options.config && options.config.start) {

    var kues = ['bulk-apply-applications-kue'];
    seneca.act({role: 'kue-queue', cmd: 'start', config: options.config}, function (err, queue) {
      console.log("K")
        if (!err) {
          async.eachSeries(kues, function (kue, cb) {
            seneca.act({role: 'kue-queue', cmd: 'work', name: kue}, function (err, worker) {
              if (err) return new Error(err);
              cb();
            });
          });
        } else {
          //return func to check for seneca Q
          return new Error('Redis queue couldn\'t be started');
        }
    });


//HERE? ?
  }
  else{

      seneca.act({role: 'queue', cmd: 'start'})

  }
//Q needs to start here


  return {

    name: 'queues',
    exportmap: {
      sendEmail: sendEmail
    }
  }

}
