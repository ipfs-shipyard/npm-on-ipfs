#! /usr/bin/env node

'use strict'

require('dnscache')({ enable: true })

const pkg = require('../../package')
const path = require('path')
const os = require('os')
const rc = require('rc')

process.title = pkg.name

const yargs = require('yargs')
  .config(rc('ipfsnpm', null, {}))

yargs.command('$0', 'Installs your js dependencies using IPFS', (yargs) => { // eslint-disable-line no-unused-expressions
  yargs
    .option('package-manager', {
      describe: 'Which package manager to use - eg. npm or yarn',
      default: process.argv[1].indexOf('yarn') === -1 ? 'npm' : 'yarn'
    })

    .option('ipfs-registry', {
      describe: 'Where to download any packages that haven\'t made it into the registry index yet from',
      default: 'https://registry.js.ipfs.io'
    })
    .option('registry-upload-size-limit', {
      describe: 'How large a file upload to allow when proxying for the registry',
      default: '1024MB'
    })
    .option('registry-update-interval', {
      describe: 'Only request the manifest for a given module every so many ms',
      default: 60000
    })
    .option('registry-connect-timeout', {
      describe: 'How long to wait while dialling the mirror before timing out',
      default: 5000
    })
    .option('registry-read-timeout', {
      describe: 'How long to wait for individual packages before timing out',
      default: 5000
    })

    .option('ipfs-mfs-prefix', {
      describe: 'Which mfs prefix to use',
      default: '/npm-registry'
    })
    .option('ipfs-node', {
      describe: '"proc" to start an in-process IPFS node, "disposable" to start an in-process disposable node, "go" or "js" to spawn an IPFS node as a separate process or a multiaddr that resolves to a running node',
      default: 'proc'
    })
    .option('ipfs-repo', {
      describe: 'If --ipfs-node is set to "proc", this is the path that contains the IPFS repo to use',
      default: path.join(os.homedir(), '.jsipfs')
    })
    .option('ipfs-flush', {
      describe: 'Whether to flush the MFS cache',
      default: true
    })

    .option('clone-pin', {
      describe: 'Whether to pin cloned modules',
      default: false
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

    .option('npm-registry', {
      describe: 'A fallback to use if the IPFS npm registry is unavailable',
      default: 'https://registry.npmjs.com'
    })
}, require('../core'))
  .argv
