var test = require('tape')
var env = require('.')
var ns = 'foo-test-creds-ns'

test('env', t=> {
  t.plan(8)
  t.ok(env.create, 'env.create')
  t.ok(env.delete, 'env.delete')
  t.ok(env.nuke, 'env.nuke')
  t.ok(env.rand, 'env.rand')
  t.ok(env.read, 'env.read')
  t.ok(env.reset, 'env.reset')
  t.ok(env.versions, 'env.versions')
  t.ok(env.write, 'env.write')
})

test('env.create', t=> {
  t.plan(1)
  env.create({
    ns
  },
  function _create(err, result) {
    if (err) {
      t.fail(err)
    } 
    else {
      t.ok(result, 'got result')
      console.log(result)
    }
  })
})

test('env.read', t=> {
  t.plan(1)
  env.read({
    ns 
  },
  function _read(err, result) {
    if (err) {
      t.fail(err)
    } 
    else {
      t.ok(result, 'got result')
      console.log(result)
    }
  })
})

test('env.write', t=> {
  t.plan(1)
  env.write({
    ns,
    key: 'hi',
    value: 'world',
  },
  function _write(err, result) {
    if (err) {
      t.fail(err)
    } 
    else {
      t.ok(result, 'got result')
      console.log(result)
    }
  })
})

test('env.write async safe', t=> {
  t.plan(6)
  var config = {
    PRIVATE_API: 'https://private.example.com', 
    PUBLIC_API: 'https://api.example.com',
    SLACK_ENDPOINT: 'https://slack.example.com',
    FOO: true,
    BAZ: 1111,
  }
  env.reset({
    ns
  },
  function _reset(err, result) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(result, 'reset')
      Object.keys(config).forEach(k=> {
        env.write({
          ns,
          key: k,
          value: config[k],
        },
        function _read(err, result) {
          if (err) {
            t.fail(err)
          } 
          else {
            t.ok(result, 'got result')
            console.log(result)
            console.log(config)
          }
        })
      })
    }
  })
})

test('env.delete', t=> {
  t.plan(1)
  env.delete({
    ns,
    key: 'hi',
  },
  function _read(err, result) {
    if (err) {
      t.fail(err)
    } 
    else {
      t.ok(result, 'got result')
      console.log(result)
    }
  })
})

var v
test('env.versions', t=> {
  t.plan(1)
  env.versions({
    ns,
  },
  function _read(err, result) {
    if (err) {
      t.fail(err)
    } 
    else {
      t.ok(result, 'got result')
      console.log(result.length)
    }
  })
})
