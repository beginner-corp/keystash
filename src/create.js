var aws = require('aws-sdk')
var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var createKey = require('./_create-kms-key')

/**
 * create a versioned s3 bucket and master kms key named alias/arc
 */
module.exports = function create(params, callback) {
  assert(params, {
    ns: String,
  })
  function createBucket(callback) {
    var s3 = new aws.S3
    s3.createBucket({
      Bucket: params.ns,
      ACL: 'private',
    }, callback)
  }
  waterfall([
    function _create(callback) {
      parallel([
        createBucket,
        createKey,
      ], callback)
    },
    function _version(bucket, callback) {
      var s3 = new aws.S3
      s3.putBucketVersioning({
        Bucket: params.ns, 
        VersioningConfiguration: {
          MFADelete: 'Disabled', 
          Status: 'Enabled',
        }
      }, callback)
    },
  ], callback)
}

