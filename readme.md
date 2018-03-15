# 🔑💌  `keystash`

> Save secrets in AWS S3 with KMS envelope encryption

- Save key/value pairs in an S3 Bucket with KMS envelope encryption
- Additional serverside encryption with S3
- Automatic S3 versioning for durability
- Generate random key data
- Use as a module
- Bundles a simple CLI

Perfect for:

- Centralized key management with minimalist command line interface
- Environment variables in modules and npm scripts
- Lightweight and secure personal key value store

![demo](https://raw.githubusercontent.com/smallwins/keystash/master/demo.png)

## prereq

- AWS account credentials setup `.aws/credentials` 
- `AWS_PROFILE` and `AWS_REGION` environment variables 

> ✨ Tip `export` default `AWS_PROFILE` and `AWS_REGION` env vars your in `.bashrc` or `.bash_profile` and override as neccessary on the command line or in `package.json` to make working with different stashes easy

## install

```bash
npm i -g keystash
```

## command line interface

```
keystash <bucket name> [options]
```

### exmaples

Setup an S3 bucket:

- `keystash my-bucket --create ` create an S3 bucket for storing secrets

Read secrets:

- `keystash my-bucket` read encrypted secrets from S3 bucket
- `keystash my-bucket BIG_SEKRET` to read a value to stdout

Write secrets:

- `keystash my-bucket BIG_SEKRET xxx-xxx` save a secret `BIG_SEKRET` with value `xxx-xxx`
- `keystash my-bucket --rand BIG_SEKRET` to generate (really!) random key data
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
  "start": "DB_URL=${keystash some-bucket DB_URL} node index"
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

## api

```javascript
var keystash = require('keystash')
```

- `keystash.create({ns}, err=>)` create a `keystash` S3 bucket
- `keystash.delete({ns, key}, (err, result)=>)` remove a key
- `keystash.env({ns}, err=>)` add secrets to `process.env`
- `keystash.nuke({ns}, err=>)` remove all versions
- `keystash.rand({key}, (err, result)=>)` generate a random key
- `keystash.read({ns}, (err, result)=>)` get all secrets
- `keystash.read({ns, version}, (err, result)=>)` get all secrets for given version
- `keystash.reset({ns}, (err, result)=>)` remove all secrets from the current version
- `keystash.versions({ns}, (err, result)=>)` get all versions
- `keystash.write({ns, key, value}, (err, result)=>)` save a secret

## acknowledgements

This module is inspired by [credstash](https://github.com/fugue/credstash). This module differs in that its JavaScript instead of Python and uses S3 to persist secrets instead of Dynamo. [Read more about credstash here.](https://blog.fugue.co/2015-04-21-aws-kms-secrets.html)

Also thx to [Matt Weagle](https://twitter.com/mweagle) for encouraging KMS envelope encryption and [Ben Kehoe](https://twitter.com/ben11kehoe) for suggesting to use the S3 Object Metadata property to store the KMS cipher.
