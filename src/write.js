var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var crypto = require('crypto')
var aws = require('aws-sdk')
var encrypt = require('./_encrypt')
var writeS3 = require('./_write-s3')
var read = require('./read')
var _write = require('./_write')
var lock = require('./_lock')

/**
 * write a key/value to a ns
 */
module.exports = function write(params, callback) {
  var Any = v=> true
  assert(params, {
    ns: String,
    key: String,
    value: Any,
  })
  lock.writeLock(function _writeLock() {
    waterfall([
      function(callback) {
        read(params, callback)
      },
      function(result, callback) {
        result[params.key] = params.value
        _write({
          ns: params.ns,
          payload: result,
        }, callback)
      },
    ],
    function _done(err, result) {
      lock.unlock()
      if (err) callback(err)
      else callback(null, result)
    })
  })
}
