var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var waterfall = require('run-waterfall')
var read = require('./read')
var _write = require('./_write')

/**
 * write a random value to a key
 */
module.exports = function write(params, callback) {
  assert(params, {
    key: String,
  })
  var kms = new aws.KMS
  waterfall([
    function(callback) {
      read(params, callback)
    },
    function(secrets, callback) {
      kms.generateRandom({
        NumberOfBytes: 18
      },
      function _rando(err, result) {
        if (err) {
          callback(err)
        }
        else {
          secrets[params.key] = result.Plaintext.toString('base64')
          callback(null, secrets)
        }
      })
    },
    function(result, callback) {
      _write({
        ns: params.ns,
        payload: result,
      }, callback)
    },
  ], callback)
}

