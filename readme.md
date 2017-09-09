# keystash

> Save secrets in AWS S3

- Serverside encryption
- Use as a module
- Bundles a simple CLI 

Perfect for ENV vars!

## Prereq

- `AWS_PROFILE` account with `.aws/credentials` setup
- `AWS_REGION` specified

## install

Primarily you want to use this module in `npm scripts`.

```
npm i keystash --save
```

> It is also possible to use this module globally by adding `-g` flag.

## module usage

```javascript
var keystash = require('keystash')
var ns = 's3-bucket-name'

keystash.read({ns}, console.log)
```

See tests for more examples!

## cli usage

In a project with npm scripts.

```javascript
// package.json
{
  "start":  "DB_URL=${keystash my-app-bucket -g DB_URL} node server.js"
}
```

Or install globally:

```bash
npm i -g keystash
```

And use the command line interface:

```bash
keystash --help
```
