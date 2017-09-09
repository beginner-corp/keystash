#!/usr/bin/env node
var secrets = require('.')
var yargs = require('yargs')

var argv = require('yargs')
  .usage('Usage: $0 <bucket> [option]')
  .example('$0 secret-keystash', 'List all secrets')
  .describe('create', 'Create a keystash bucket')
  .alias('c', 'create')
  .describe('put', 'Encrypt a key/value pair')
  .alias('p', 'put')
  .describe('get', 'Get a value by key')
  .alias('g', 'get')
  .describe('delete', 'Delete a key')
  .alias('d', 'delete')
  .describe('reset', 'Remove all keys in the latest version')
  .alias('r', 'reset')
  .describe('versions', 'List all versions')
  .alias('v', 'versions')
  .describe('nuke', 'Remove all versions')
  .alias('n', 'nuke')
  .help('h')
  .alias('h', 'help')
  .argv

// helper to check for undefined
// @returns {Boolean}
var undef = val=> typeof val === 'undefined'

// if no args given
var blank = argv._.length === 0 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  undef(argv.get) && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  undef(argv.versions) && 
  undef(argv.nuke)

// read secrets from s3 bucket
var listSecrets = argv._.length === 1 &&
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  undef(argv.get) && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  undef(argv.versions) && 
  undef(argv.nuke)

// create a bucket for secrets
var createBucket = argv._.length === 1 && 
  argv.h === false && 
  argv.help === false && 
  argv.create && 
  undef(argv.put) && 
  undef(argv.get) && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  undef(argv.versions) && 
  undef(argv.nuke)

// add a secret
var putKey = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  argv.put && 
  undef(argv.get) && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  undef(argv.versions) && 
  undef(argv.nuke)

// get a secret
var getKey = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  argv.get && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  undef(argv.versions) && 
  undef(argv.nuke)

// remove a secret
var delKey = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  undef(argv.get) && 
  argv.delete && 
  undef(argv.reset) && 
  undef(argv.versions) && 
  undef(argv.nuke)

// reset all secrets in the latest version
var reset = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  undef(argv.get) && 
  undef(argv.delete) && 
  argv.reset && 
  undef(argv.versions) && 
  undef(argv.nuke)

// get all versions
var versions = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  undef(argv.get) && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  argv.versions && 
  undef(argv.nuke)

// remove all versions
var nuke = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  undef(argv.get) && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  undef(argv.versions) && 
  argv.nuke

// command not found 
var notFound = !nuke && 
    !versions && 
    !reset && 
    !delKey && 
    !putKey && 
    !getKey && 
    !createBucket && 
    !listSecrets &&
    !blank

if (blank) {
  console.log('missing bucket argument')
  process.exit(1)
}

if (listSecrets) {
  console.log('reading secrets')
  secrets.read({
    ns: argv._[0]
  }, 
  function _read(err, result) {
    if (err && err.name === 'NoSuchBucket') {
      console.log('bucket not found')
      process.exit(1) 
    }
    else if (err) {
      console.log(err)
      process.exit(1)
    }
    else {
      console.log(result)
      process.exit()
    }  
  })
}

if (createBucket) {
  var ns = argv._[0]
  console.log('creating s3 bucket ' + ns)
  secrets.create({
    ns
  },
  function _create(err, result) {
    if (err) {
      console.log(err)
      process.exit(1)
    } 
    else {
      console.log('created ' + ns)
      process.exit()
    }
  })
}

if (putKey) {
  var ns = argv._[0]
  var key = argv.put
  var value = argv._[1]
  if (!key || !value) {
    console.log('missing key and/or value')
    process.exit(1)
  }
  secrets.write({
    ns,
    key,
    value,
  },
  function _read(err, result) {
    if (err) {
      console.log(err)
      process.exit(1)
    } 
    else {
      console.log(JSON.stringify(result, null, 2))
      console.log(`saved ${key} ${value}`)
      process.exit()
    }
  })
}

if (getKey) {
  var key = argv.get
  secrets.read({
    ns: argv._[0]
  }, 
  function _read(err, result) {
    if (err && err.name === 'NoSuchBucket') {
      console.log('bucket not found')
      process.exit(1) 
    }
    else if (err) {
      console.log(err)
      process.exit(1)
    }
    else {
      console.log(result[key])
      process.exit()
    }  
  })
}

if (delKey) {
  var ns = argv._[0]
  var key = argv.delete
  secrets.delete({
    ns,
    key,
  },
  function _read(err, result) {
    if (err) {
      console.log(err)
      process.exit(1) 
    } 
    else {
      console.log(JSON.stringify(result, null, 2))
      process.exit()
    }
  })
}

if (reset) {
  console.log('reset keys')
  process.exit()
}
  
if (versions) {
  console.log('show all versions')
  process.exit()
}

if (nuke) {
  console.log('nuke all versions')
  process.exit()
}

if (notFound) {
  console.log('keystash command not found!')
  process.exit(1)
}
