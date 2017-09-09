var assert = require('@smallwins/validate/assert')
var AsyncLock = require('async-lock')
var aws = require('aws-sdk')

module.exports = function _writeS3(params, callback) {
  assert(params, {
    ns: String,
    cipher: String,
    payload: String,
  })
  var lock = new AsyncLock
  lock.acquire('_write', function _acquire(done){
    var s3 = new aws.S3
    s3.putObject({
      Body: params.payload, 
      Bucket: params.ns, 
      Key: 'archive',
      ContentType: 'text/plain',
      ServerSideEncryption: 'AES256', 
      Metadata: {
        cipher: params.cipher
      }
    }, done)
  }, 
  function _done(err){
    if (err) {
      callback(err)
    }
    else {
      callback()
    }
  })
}
