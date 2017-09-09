var assert = require('@smallwins/validate/assert')
var read = require('./read')
var _write = require('./_write')

/**
 * delete a key/value from a ns
 */
module.exports = function _delete(params, callback) {
  assert(params, {
    ns: String,
    key: String,
  })
  read(params, function _r(err, result) {
    if (err) {
      callback(err)
    }
    else {
      delete result[params.key]
      _write({
        ns: params.ns,
        payload: result,
      }, callback)
    }
  })
}

