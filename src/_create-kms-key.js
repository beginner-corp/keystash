var aws = require('aws-sdk')
var waterfall = require('run-waterfall')

/**
 * creates a kms master key alias/arc
 */
module.exports = function _createKey(callback) {
  var kms = new aws.KMS
  kms.listAliases({}, function _aliases(err, results) {
    if (err) throw err
    var hasArc = !!results.Aliases.find(a=> a.AliasName === 'alias/arc')
    if (hasArc) {
      callback()
    }
    else {
      waterfall([
        function _createKey(callback) {
          kms.createKey({
            Tags: [{
              TagKey: 'CreatedBy', 
              TagValue: 'JSF Architect'
            }]
          }, callback)
        },
        function _addAlias(key, callback) {
          kms.createAlias({
            AliasName: 'alias/arc',
            TargetKeyId: key.KeyMetadata.KeyId,
          }, callback)      
        }
      ], callback)
    }
  })
}
