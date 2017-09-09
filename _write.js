var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var crypto = require('crypto')
var aws = require('aws-sdk')
var encrypt = require('./_encrypt')
var write = require('./_write-s3')

module.exports = function _write(params, callback) {
  assert(params, {
    payload: Object,
    ns: String,
  })
  waterfall([
    function e(callback) {
      encrypt(params, callback)
    },
    function w(result, callback) {
      write({
        ns: params.ns, 
        payload: result.encrypted,
        cipher: result.cipher,
      }, callback) 
    }
  ], 
  function _done(err) {
    if (err) {
      callback(err)
    }
    else {
      callback(null, params.payload)
    }
  })
}
