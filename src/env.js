var assert = require('@smallwins/validate/assert')
var read = require('./read')

/**
 * loads secrets for given ns into process.env
 */
module.exports = function env(params, callback) {
  assert(params, {
    ns: String
  })
  read(params, function _read(err, result) {
    if (err) {
      callback(err)
    }
    else {
      Object.keys(result).forEach(key=> {
        process.env[key] = result[key]
      })
      callback()
    }
  })
}
