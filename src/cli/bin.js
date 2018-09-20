#! /usr/bin/env node

'use strict'

const pkg = require('../../package')

process.title = pkg.name

const yargs = require('yargs')

yargs.command('$0', 'Starts a registry server that uses IPFS to fetch js dependencies', (yargs) => { // eslint-disable-line no-unused-expressions
  yargs
    .option('clone', {
      describe: 'Whether to clone the registry in the background',
      default: true
    })
    .option('eager-download', {
      describe: 'Whether to eagerly download tarballs',
      default: true
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
    .option('clone-skim', {
      describe: 'Which registry to clone',
      default: 'https://skimdb.npmjs.com/registry'
    })
    .option('clone-skim', {
      describe: 'Which registry to clone',
      default: 'https://replicate.npmjs.com/registry'
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
}, require('../core/mirror'))
  .argv
