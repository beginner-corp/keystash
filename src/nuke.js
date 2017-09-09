var assert = require('@smallwins/validate/assert')
var write = require('./write')

/**
 * reset a ns
 */
module.exports = function _delete(params, callback) {
  assert(params, {
    ns: String,
  })
  write({
    ns: params.ns,
    payload: {},
  }, callback)
}

