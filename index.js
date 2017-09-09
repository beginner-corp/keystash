var create = require('./create')
var del = require('./delete')
var nuke = require('./nuke')
var read = require('./read')
var reset = require('./reset')
var versions = require('./versions')
var write = require('./write')

if (!process.env.AWS_PROFILE) {
  throw ReferenceError('missing process.env.AWS_PROFILE')
}

if (!process.env.AWS_REGION) {
  throw ReferenceError('missing process.env.AWS_REGION')
}

module.exports = {
  create,
  delete: del, 
  nuke,
  read, 
  reset,
  versions,
  write, 
}
