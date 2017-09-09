var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')

/**
 * list all versions for given ns
 */
module.exports = function versions(params, callback) {
  assert(params, {
    ns: String,
  //version: String <-- optional
  })
  var s3 = new aws.S3
  s3.listObjectVersions({
    Bucket: params.ns, 
    Prefix: 'archive',
  },
  function _versions(err, result) {
    if (err) {
      callback(err)
    }
    else {
      var ver = v=> ({version: v.VersionId, modified: v.LastModified})
      callback(null, result.Versions.map(ver))
    }
  })
}

