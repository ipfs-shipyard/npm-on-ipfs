/* globals describe, before, after*/

'use strict'

const expect = require('chai').expect
const ipfsd = require('ipfsd-ctl')
const ncp = require('ncp')
const rimraf = require('rimraf')

describe('core', () => {
  const repoExample = process.cwd() + '/tests/ipfs-repo-tests'
  const repoTests = process.cwd() + '/tests/t-run-' + Date.now()

  before(function (done) {
    this.timeout(500000)
    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist
      ipfsd.disposable({
        repoPath: repoTests,
        init: false
      }, (err, node) => {
        expect(err).to.not.exist
        node.startDaemon((err) => {
          expect(err).to.not.exist
          done()
        })
      })
    })
  })

  after(function (done) {
    this.timeout(50000)
    rimraf(repoTests, err => {
      expect(err).to.equal(null)
      done()
    })
  })

  require('./test-mirror.js')
})
