#! /usr/bin/env node

'use strict'

require('dnscache')({ enable: true })

const pkg = require('../../package')
const path = require('path')

process.title = pkg.name

const yargs = require('yargs')

yargs.command('$0', 'Starts a registry server that uses IPFS to fetch js dependencies', (yargs) => { // eslint-disable-line no-unused-expressions
  yargs
    .option('registry', {
      describe: 'Which registry we are mirroring',
      default: 'https://registry.npmjs.com'
    })
    .option('registry-update-interval', {
      describe: 'Only request the manifest for a given module every so many ms',
      default: 60000
    })
    .option('registry-upload-size-limit', {
      describe: 'How large a file upload to allow when proxying for the registry',
      default: '1024MB'
    })

    .option('http-protocol', {
      describe: 'Which protocol to use with the server',
      default: 'http'
    })
    .option('http-host', {
      describe: 'Which host to listen to requests on',
      default: 'localhost'
    })
    .option('http-port', {
      describe: 'Which port to listen to requests on',
      default: 8080
    })

    .option('external-protocol', {
      describe: 'Which protocol to use when reaching this mirror'
    })
    .option('external-host', {
      describe: 'Which host to use when reaching this mirror'
    })
    .option('external-port', {
      describe: 'Which port to use when reaching this mirror'
    })

    .option('ipfs-port', {
      describe: 'Which port to accept IPFS connections on',
      default: 40020
    })
    .option('ipfs-mfs-prefix', {
      describe: 'Which mfs prefix to use',
      default: '/commons-registry'
    })
    .option('ipfs-flush', {
      describe: 'Whether to flush the MFS cache',
      default: true
    })
    .option('ipfs-repo', {
      describe: 'The path to the IPFS repo you wish to use',
      default: path.join(process.env.HOME, '.jsipfs')
    })
    .option('ipfs-store-type', {
      describe: 'Which type of datastore to use - fs, s3, etc',
      default: 'fs'
    })
    .option('ipfs-store-s3-region', {
      describe: 'The s3 region to use'
    })
    .option('ipfs-store-s3-bucket', {
      describe: 'The s3 bucket to use'
    })
    .option('ipfs-store-s3-path', {
      describe: 'The path to use in an s3 bucket'
    })
    .option('ipfs-store-s3-access-key-id', {
      describe: 'The s3 access key id to use'
    })
    .option('ipfs-store-s3-secret-access-key', {
      describe: 'The s3 secret access key id to use'
    })
    .option('ipfs-store-s3-create-if-missing', {
      describe: 'Whether to create the bucket if it is missing',
      default: false
    })

    .option('pubsub-master', {
      describe: 'The url of the pubsub replication master',
      default: 'https://replication.registry.js.ipfs.io'
    })

    .option('request-max-sockets', {
      describe: 'How many concurrent http requests to make while cloning the repo',
      default: 10
    })
    .option('request-retries', {
      describe: 'How many times to retry when downloading manifests and tarballs from the registry',
      default: 5
    })
    .option('request-retry-delay', {
      describe: 'How long in ms to wait between retries',
      default: 1000
    })
    .option('request-timeout', {
      describe: 'How long in ms we should wait when requesting files',
      default: 30000
    })
}, require('../core'))
  .argv
