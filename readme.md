# 🔑💌  <kbd>`keystash`</kbd>

> Save secrets in AWS S3 with KMS envelope encryption

- Encrypt/decrypt key/value pairs in an S3 Bucket with KMS envelope encryption
- Additional serverside encryption with S3
- Automatic S3 versioning
- Use as a module
- Bundles a simple CLI 

Perfect for:

- Environment variables in modules
- Env vars in npm scripts
- Centralized key management with minimal command line interface

## prereq

- AWS account credentials setup `.aws/credentials` 
- `AWS_PROFILE` and `AWS_REGION` environment variables

## install

```bash
npm i -g keystash
```

## command line interface

```
keystash <bucket name> [options]
```

### exmaples

Setup a bucket:

- `keystash --create my-bucket` create an S3 bucket for storing secrets

Read secrets:

- `keystash my-bucket` read encrypted secrets from S3 bucket
- `keystash my-bucket --get BIG_SEKRET` read `BIG_SEKRET` value to stdout

Write secrets:

- `keystash my-bucket --put BIG_SEKRET xxx-xxx` save a secret `BIG_SEKRET`
- `keystash my-bucket --delete BIG_SEKRET` remove `BIG_SEKRET`
- `keystash my-bucket --reset` remove all secrets from latest version

Working with versions:

- `keystash my-bucket --versions` list all versions
- `keystash my-bucket --versions some-version-id` get secrets for a given version
- `keystash my-bucket --nuke` remove all versions

Run `keystash --help` to see short switches.

## module install and usage

Use this module in `npm scripts`.

```
npm i keystash --save
```

```javascript
// package.json
{
  "start": "DB_URL=${keystash cred-bucket -g DB_URL} node index"
}
```

Or a bash script:

```bash
AWS_PROFILE=xxx
AWS_REGION=xxx
NODE_ENV=testing
DB_URL=`keystash cred-bucket --get DB_URL`

node index
```

Or in module code itself:

```javascript
var keystash = require('keystash')
var ns = 's3-bucket-name'

keystash.read({ns}, console.log)
```

See tests for more examples!
