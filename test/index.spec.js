/* eslint-env mocha */
'use strict'

const ipfsd = require('ipfsd-ctl')
const ncp = require('ncp')
const rimraf = require('rimraf')
const waterfall = require('async/waterfall')
const series = require('async/series')

ncp.limit = 16

describe('core', () => {
  const repoExample = process.cwd() + '/test/test-data/repo'
  const repoTests = process.cwd() + '/test/t-run-' + Date.now()
  let node

  before(function (done) {
    this.timeout(500000)

    waterfall([
      (cb) => ncp(repoExample, repoTests, cb),
      (cb) => ipfsd.disposable({
        repoPath: repoTests,
        init: false
      }, cb),
      (_node, cb) => {
        node = _node
        node.startDaemon(cb)
      }
    ], done)
  })

  after(function (done) {
    this.timeout(50000)
    series([
      // TODO: figure out why ipfsd-ctl throws here
      // (cb) => node.stopDaemon(cb),
      (cb) => rimraf(repoTests, cb)
    ], done)
  })

  require('./test-mirror')
})
