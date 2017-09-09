var assert = require('@smallwins/validate/assert')
var write = require('./_write')

/**
 * reset a ns
 */
module.exports = function _reset(params, callback) {
  assert(params, {
    ns: String,
  })
  write({
    ns: params.ns,
    payload: {},
  }, callback)
}

