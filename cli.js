#!/usr/bin/env node
var chalk = require('chalk')
var prereq = []

if (!process.env.AWS_PROFILE) {
  prereq.push('AWS_PROFILE')
}

if (!process.env.AWS_REGION) {
  prereq.push('AWS_REGION')
}

var fail = prereq.length != 0
if (fail) {
  console.log(chalk.red('Error!') + ' ' + chalk.yellow('Missing env variables:'))
  prereq.forEach(p=> {
    console.log(chalk.dim(' - ') + chalk.cyan(p))  
  })
  process.exit(1)
}

// prereq check passed; grab deps
var pad = require('lodash.padstart')
var strftime = require('strftime')
var end = require('lodash.padend')
var secrets = require('.')
var yargs = require('yargs')

// setup the cli args
var argv = require('yargs')
  .usage('Usage: $0 <bucket> [option]')
  .example('$0', 'List all secrets')
  .example('$0 bukkit keyname keyvalue', 'Save a secret')
  .example('$0 bukkit keyname', 'Get a secret')
  .example('$0', 'List all secrets')
  .describe('create', 'Create a keystash bucket')
  .alias('c', 'create')
  .describe('put', 'Encrypt a key/value pair')
  .alias('p', 'put')
  .describe('get', 'Get a value by key')
  .alias('g', 'get')
  .describe('delete', 'Delete a key')
  .alias('d', 'delete')
  .describe('reset', 'Remove all keys in the latest version')
  .describe('rand', 'Generate random data for a key')
  .describe('versions', 'List all versions')
  .alias('v', 'versions')
  .describe('nuke', 'Remove all versions')
  .alias('n', 'nuke')
  .describe('json', 'Export secrets as JSON to stdout')
  .help('h')
  .alias('h', 'help')
  .version()
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
var listSecrets = (argv._.length === 1 || argv._.length === 2) &&
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  undef(argv.get) && 
  undef(argv.delete) && 
  undef(argv.rand) &&
  undef(argv.reset) && 
  undef(argv.versions) && 
  undef(argv.nuke) &&
  undef(argv.json) &&
  undef(argv.env) 

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
  undef(argv.rand) &&
  undef(argv.versions) && 
  undef(argv.nuke)

// support for syntax:
//   keystash BUCKET KEY VAL
if (argv._.length === 3 && undef(argv.put)) {
  putKey = true
  argv.put = argv._[1]
  argv._[1] = argv._[2]
}

// generate a key
var isRand = !!(argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  argv.rand)

// get a secret
var getKey = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  undef(argv.create) && 
  undef(argv.put) && 
  argv.get && 
  undef(argv.delete) && 
  undef(argv.reset) && 
  undef(argv.rand) &&
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
  undef(argv.rand) &&
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
  undef(argv.rand) &&
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

// export JSON to stdout
var json = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  argv.json

// export to current process
var env = argv._.length >= 1 && 
  argv.h === false && 
  argv.help === false && 
  argv.env

// command not found 
var notFound = !nuke && 
    !versions && 
    !reset && 
    !delKey && 
    !putKey && 
    !getKey && 
    !createBucket && 
    !listSecrets &&
    !isRand &&
    !blank &&
    !json &&
    !env

function list(ns, title, result) {
  console.log('')
  var head = chalk.dim(ns)
  var title = chalk.dim.cyan(title)
  console.log(' ' + head + ' ' + title)
  console.log(chalk.dim('────────────────────────────────────────────────────────────'))
  if (result) {
    var out = ''
    Object.keys(result).forEach(key=> {
      var keyname = pad(chalk.dim(key), 35)
      var value = end(chalk.cyan(result[key]), 35)
      out += `${keyname} ${value}\n`
    })
    console.log(out)
  }
  process.exit()
}

if (blank) {
  var err = chalk.red('Error!')
  var msg = chalk.yellow(' Missing S3 bucket argument.')
  console.log(err + msg)
  process.exit(1)
}

if (listSecrets) {
  var ns = argv._[0]
  var key = argv._[1]
  secrets.read({
    ns
  }, 
  function _read(err, result) {
    if (err && err.name === 'NoSuchBucket') {
      var err = chalk.red('Error!')
      var msg = chalk.yellow(' S3 bucket not found.')
      console.log(err + msg)
      process.exit(1) 
    }
    else if (err) {
      var error = chalk.red('Error!')
      var msg = chalk.yellow(err.message)
      console.log(error + msg)
      process.exit(1)
    }
    else if (key) {
      console.log(result[key])
      process.exit()
    }  
    else {
      list(ns, 'secrets key', result)
    }
  })
}

if (createBucket) {
  var ns = argv._[0]
  secrets.create({
    ns
  },
  function _create(err, result) {
    if (err) {
      var error = chalk.red('Error!')
      var msg = chalk.yellow(err.message)
      console.log(error + msg)
      process.exit(1)
    } 
    else {
      var rex = chalk.green('Created')
      var msg = chalk.cyan(` ${ns}`)
      console.log(rex + msg)
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
      list(ns, 'put', result) 
    }
  })
}

if (isRand) {
  var ns = argv._[0]
  var key = argv.rand
  if (!key) {
    console.log('missing key')
    process.exit(1)
  }
  secrets.rand({
    ns,
    key,
  },
  function _read(err, result) {
    if (err) {
      console.log(err)
      process.exit(1)
    } 
    else {
      list(ns, 'rand', result) 
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
      list(ns, 'deleted', result) 
    }
  })
}

if (reset) {
  var ns = argv._[0]
  secrets.reset({
    ns,
  },
  function _reset(err, result) {
    if (err) {
      console.log(err)
      process.exit(1) 
    } 
    else {
      list(ns, 'reset', result) 
    }
  })
}
  
if (versions) {
  var ns = argv._[0]
  var key = argv._[1]
  var version = typeof argv.versions === 'boolean'? false : argv.versions
  if (version && !key) {
    // display one version
    secrets.read({
      ns,
      version,
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
        list(ns, version, result) 
        process.exit()
      }  
    })
  }
  else if (version && key) {
    // display one key of a version
    secrets.read({
      ns,
      version,
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
  else {
    // display all versions
    secrets.versions({
      ns,
    },
    function _versions(err, result) {
      if (err) {
        console.log(err)
        process.exit(1) 
      } 
      else {
        function remap(v) {
          var obj = {}
          var d = strftime('%B %d, %Y %l:%M:%S', v.modified)
          obj[d] = v.version
          return obj
        }
        var versions = result.map(remap).reduce((a,b)=> Object.assign({}, a, b))
        list(ns, 'versions', versions) 
      }
    })
  }
}

if (nuke) {
  var ns = argv._[0]
  secrets.nuke({
    ns,
  },
  function _nuke(err, result) {
    if (err) {
      console.log(err)
      process.exit(1) 
    } 
    else {
      list(ns, 'nuked', versions) 
      process.exit()
    }
  })
}

if (json) {
  var ns = argv._[0]
  secrets.read({
    ns
  }, 
  function _read(err, result) {
    if (err && err.name === 'NoSuchBucket') {
      var err = chalk.red('Error!')
      var msg = chalk.yellow(' S3 bucket not found.')
      console.log(err + msg)
      process.exit(1) 
    }
    else if (err) {
      var error = chalk.red('Error!')
      var msg = chalk.yellow(err.message)
      console.log(error + msg)
      process.exit(1)
    }
    else {
      console.log(JSON.stringify(result, null, 2))
      process.exit()
    }
  })
}

if (notFound) {
  var err = chalk.red('Error!')
  var msg = chalk.cyan(` Command not found.`)
  console.log(err + msg)
  process.exit(1)
}
