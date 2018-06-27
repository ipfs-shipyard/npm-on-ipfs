/* globals describe, before, after */

'use strict'

const ipfsd = require('ipfsd-ctl')
const df = ipfsd.create({
  // type: 'js'
})
const ncp = require('ncp')
const rimraf = require('rimraf')
const series = require('async/series')
const config = require('../../src/config')

describe('core', () => {
  const repoExample = process.cwd() + '/tests/ipfs-repo-tests'
  const repoTests = process.cwd() + '/tests/t-run-' + Date.now()

  before(function (done) {
    this.timeout(500000)

    series([
      (cb) => ncp(repoExample, repoTests, cb),
      (cb) => df.spawn({
        disposable: true,
        repoPath: repoTests,
        start: true
      }, cb)
    ], (error, results) => {
      if (!error) {
        global.daemon = results.pop()

        config.mirror = {
          host: 'localhost',
          port: 9040
        }
        config.apiCtl = global.daemon.api
        config.blobStore = {
          host: global.daemon.api.apiHost,
          port: global.daemon.api.apiPort,
          baseDir: '/npm-mirror'
        }
      }

      done(error)
    })
  })

  after(function (done) {
    this.timeout(50000)

    series([
      (cb) => global.daemon ? global.daemon.stop(cb) : cb(),
      (cb) => rimraf(repoTests, cb)
    ], done)
  })

  require('./test-mirror.js')
  require('./test-files.js')
  require('./test-util.js')
  require('./test-verify.js')
})
