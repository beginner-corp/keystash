# 🔑💌  `keystash`

> Save secrets in AWS S3 with KMS envelope encryption

- Encrypt/decrypt key/value pairs in an S3 Bucket with KMS envelope encryption
- Additional serverside encryption with S3
- Automatic S3 versioning for durability
- Generate random key data
- Use as a module
- Bundles a simple CLI 

Perfect for:

- Centralized key management with minimalist command line interface
- Environment variables in modules and npm scripts
- Lightweight and secure personal key value store

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
- `keystash my-bucket BIG_SEKRET` to read a value to stdout

Write secrets:

- `keystash my-bucket --put BIG_SEKRET xxx-xxx` save a secret `BIG_SEKRET`
- `keystash my-bucket --rand BIG_SEKRET` to generate a key
- `keystash my-bucket --delete BIG_SEKRET` remove `BIG_SEKRET`
- `keystash my-bucket --reset` remove all secrets from latest version

Working with versions:

- `keystash my-bucket --versions` list all versions
- `keystash my-bucket --versions some-version-id` get secrets for a given version
- `keystash my-bucket --versions some-version-id some-key` get the key for the given version
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
  "start": "DB_URL=${keystash cred-bucket DB_URL} node index"
}
```

Or a bash script:

```bash
AWS_PROFILE=xxx
AWS_REGION=xxx
NODE_ENV=testing
DB_URL=`keystash cred-bucket DB_URL`

node index
```

Or in module code itself:

```javascript
var keystash = require('keystash')

keystash.read({ns: 's3-bucket-name'}, console.log)
```

See tests for more examples!
