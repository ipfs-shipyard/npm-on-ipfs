#! /usr/bin/env node

'use strict'

require('dnscache')({ enable: true })

const pkg = require('../../package')
const path = require('path')

process.title = pkg.name

const yargs = require('yargs')

yargs.command('$0', 'Starts a registry server that uses IPFS to fetch js dependencies', (yargs) => { // eslint-disable-line no-unused-expressions
  yargs
    .option('clone', {
      describe: 'Whether to clone the registry in the background',
      default: true
    })
    .option('replicate', {
      describe: 'Whether to replicate the registry in the background',
      default: true
    })
    .option('eager-download', {
      describe: 'Whether to eagerly download tarballs',
      default: false
    })
    .option('mirror-host', {
      describe: 'Which host to listen to requests on',
      default: 'localhost'
    })
    .option('mirror-port', {
      describe: 'Which port to listen to requests on',
      default: 50321
    })
    .option('mirror-protocol', {
      describe: 'Which protocol to use with the server',
      default: 'http'
    })
    .option('mirror-registry', {
      describe: 'Where to download missing files from/proxy for non-get requests',
      default: 'https://registry.npmjs.com'
    })
    .option('mirror-upload-size-limit', {
      describe: 'How large a file upload to allow when proxying for the registry',
      default: '1024MB'
    })
    .option('registry-update-interval', {
      describe: 'Only request the manifest for a given module every so many ms',
      default: 60000
    })
    .option('ipfs-port', {
      describe: 'Which port the daemon is listening on',
      default: null
    })
    .option('external-host', {
      describe: 'Which host to use when reaching this mirror'
    })
    .option('external-port', {
      describe: 'Which port to use when reaching this mirror'
    })
    .option('external-protocol', {
      describe: 'Which protocol to use when reaching this mirror'
    })
    .option('ipfs-host', {
      describe: 'Which host the daemon is listening on',
      default: 'localhost'
    })
    .option('ipfs-base-dir', {
      describe: 'Which mfs prefix to use',
      default: '/commons-registry'
    })
    .option('ipfs-flush', {
      describe: 'Whether to flush the MFS cache',
      default: true
    })
    .option('ipfs-max-requests', {
      describe: 'How many concurrent requests to make to the IPFS daemon',
      default: 5
    })
    .option('ipfs-type', {
      describe: '"proc" to start an in process node, "go" or "js" to connect to a remote daemon (in conjunction with --ipfs-port and --ipfs-host).',
      default: 'proc'
    })
    .option('ipfs-repo', {
      describe: 'The path to the IPFS repo you wish to use',
      default: path.join(process.env.HOME, '.jsipfs')
    })
    .option('clone-skim', {
      describe: 'Which skimdb to follow',
      default: 'https://replicate.npmjs.com/registry'
    })
    .option('clone-registry', {
      describe: 'Which registry to clone',
      default: 'replicate.npmjs.com/registry'
    })
    .option('clone-user-agent', {
      describe: 'What user agent to specify when contacting the registry',
      default: 'IPFS registry-mirror worker'
    })
    .option('clone-delay', {
      describe: 'How long in ms to wait between cloning each module',
      default: 1000
    })
    .option('clone-upgrade-to-https', {
      describe: 'If a tarball is specifed with an http URL, whether to upgrade it to https',
      default: true
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
    .option('store-type', {
      describe: 'Which type of datastore to use - fs, s3, etc',
      default: 'fs'
    })
    .option('store-s3-region', {
      describe: 'The s3 region to use'
    })
    .option('store-s3-bucket', {
      describe: 'The s3 bucket to use'
    })
    .option('store-s3-path', {
      describe: 'The path to use in an s3 bucket'
    })
    .option('store-s3-access-key-id', {
      describe: 'The s3 access key id to use'
    })
    .option('store-s3-secret-access-key', {
      describe: 'The s3 secret access key id to use'
    })
    .option('store-s3-create-if-missing', {
      describe: 'Whether to create the bucket if it is missing',
      default: false
    })
}, require('../core'))
  .argv
