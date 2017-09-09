var assert = require('@smallwins/validate/assert')
var crypto = require('crypto')
var aws = require('aws-sdk')

/**
 * encrypts a javscript object payload
 */
module.exports = function _encrypt(params, callback) {
  assert(params, {
    payload: Object,
    ns: String,
  })
  var kms = new aws.KMS
  kms.generateDataKey({
    KeyId: 'alias/arc', 
    KeySpec: 'AES_256'
  },
  function _dataKey(err, result) {
    if (err) {
      callback(err)
    }
    else {
      var {CiphertextBlob, Plaintext, KeyId} = result
      var cipher = crypto.createCipher('aes-256-ctr', Plaintext.toString())
      var text = JSON.stringify(params.payload)
      var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
      callback(null, {encrypted, cipher: CiphertextBlob.toString('base64')})
    }
  })
}

