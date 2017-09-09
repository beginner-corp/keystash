var assert = require('@smallwins/validate/assert')
var crypto = require('crypto')
var aws = require('aws-sdk')

module.exports = function _decrypt(params, callback) {
  assert(params, {
    encrypted: String,
    cipher: Buffer,
  })

  var {encrypted, cipher} = params

  var kms = new aws.KMS
  kms.decrypt({
    CiphertextBlob: cipher
  },
  function _decrypt(err, result) {
    if (err) throw err

    var key = result.Plaintext.toString()
    var decipher = crypto.createDecipher('aes-256-ctr', key)
    var result = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')

    callback(null, JSON.parse(result)) 
  })
}
