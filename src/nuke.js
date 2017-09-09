var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var waterfall = require('run-waterfall')
var create = require('./create')
var write = require('./write')

/**
 * reset a ns
 */
module.exports = function _nuke(params, callback) {
  assert(params, {
    ns: String,
  })
  var s3 = new aws.S3
  waterfall([
    function(callback) {
      s3.listObjectVersions({
        Bucket: params.ns, 
        Prefix: 'archive',
      }, callback)
    },
    function(result, callback) {
      // loop thru versions deleting
      function remap(v) {
        var obj = {
          Key: 'archive'
        }
        obj.VersionId = v.VersionId
        return obj
      }
      s3.deleteObjects({
        Bucket: params.ns,
        Delete: {
          Objects: result.Versions.map(remap)
        },
      }, callback)
    }
  ], callback)
}

