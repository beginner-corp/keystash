var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var AsyncLock = require('async-lock')
var write = require('./_write')
var _decrypt = require('./_decrypt')

module.exports = function read(params, callback) {
  
  assert(params, {
    ns: String,
  //version: String <-- optional param 
  })

  // query params for the archive
  var query = {
    Bucket: params.ns,
    Key: 'archive',
  } 

  // optional version param
  if (params.version) {
    query.VersionId = params.version
  }

  var lock = new AsyncLock
  lock.acquire('_read', function _acquire(done){
    var s3 = new aws.S3
    s3.getObject(query, function _got(err, result) {
      if (err) {
        // if it doesn't exist create an empty obj
        write({
          ns: params.ns,
          payload: {},
        }, callback)
      }
      else {
        _decrypt({
          encrypted: result.Body.toString(),
          cipher: Buffer.from(result.Metadata.cipher, 'base64')
        }, done)
      }
    })

  }, callback)
}

