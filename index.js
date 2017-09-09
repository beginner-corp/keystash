var create = require('./src/create')
var del = require('./src/delete')
var nuke = require('./src/nuke')
var rand = require('./src/rand')
var read = require('./src/read')
var reset = require('./src/reset')
var versions = require('./src/versions')
var write = require('./src/write')

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
  rand,
  read, 
  reset,
  versions,
  write, 
}
