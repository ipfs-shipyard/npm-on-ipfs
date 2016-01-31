/* globals describe, before, after, it */

'use strict'

const expect = require('chai').expect
const ipfsd = require('ipfsd-ctl')
const ncp = require('ncp')
const rimraf = require('rimraf')
const serveNPM = require('../src/serve-npm.js')
const wreck = require('wreck')

describe('serve-npm', () => {
  var apiAddr
  var server
  const repoExample = process.cwd() + '/tests/ipfs-repo-tests'
  const repoTests = process.cwd() + '/tests/t-run-' + Date.now()

  before(function (done) {
    console.log('===> make sure to be running a IPFS 0.4.0')
    console.log('===> cp $GOPATH/bin/ipfs node_modules/go-ipfs/bin/ipfs')
    this.timeout(100000)
    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist
      ipfsd.disposable({
        repoPath: repoTests,
        init: false
      }, (err, node) => {
        expect(err).to.not.exist
        node.startDaemon((err) => {
          expect(err).to.not.exist
          apiAddr = node.apiAddr
          console.log('->api', apiAddr)
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

  it('start serving npm from IPFS', function (done) {
    this.timeout(50000)

    var options = {
      blobStore: {
        baseDir: '/npm-registry',
        host: '127.0.0.1',
        port: Number(apiAddr.split('/')[4])
      }
    }

    server = serveNPM(options, () => {
      done()
    })
  })

  it('index.json', (done) => {
    const url = 'http://127.0.0.1:' + server.port + '/'
    wreck.get(url, function (err, res, payload) {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)
      done()
    })
  })

  it('get module utf7', (done) => {
    // requests that cli makes:
    // 127.0.0.1 GET /utf7
    //   reads: /npm-registry/utf7
    //   reads: /npm-registry/utf7/index.json
    // 127.0.0.1 GET /utf7/-/utf7-1.0.0.tgz
    //   reads: /npm-registry/utf7/-/utf7-1.0.0.tgz
    const url = 'http://127.0.0.1:' + server.port + '/'
    wreck.get(url + 'utf7', function (err, res, payload) {
      expect(err).to.not.exist
      expect(res.statusCode).to.equal(200)
      wreck.get(url + 'utf7/index.json', function (err, res, payload) {
        expect(err).to.not.exist
        expect(res.statusCode).to.equal(200)
        wreck.get(url + 'utf7/-/utf7-1.0.0.tgz', function (err, res, payload) {
          expect(err).to.not.exist
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })
  })
})
