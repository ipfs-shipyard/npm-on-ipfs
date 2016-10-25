/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const wreck = require('wreck')
const parallel = require('async/parallel')

const config = require('../src/ipfs-npm/config.js')
const mirror = require('../src/ipfs-npm').daemon

describe('mirror', () => {
  const url = 'http://127.0.0.1:9040/'

  it('start serving npm from IPFS', function (done) {
    this.timeout(50000)

    config.mirror.port = 9040

    mirror(done)
  })

  it('get module utf7', (done) => {
    // requests that cli makes:
    // npm http request GET http://localhost:9876/utf7
    // npm http fetch GET http://localhost:9876/utf7/-/utf7-1.0.0.tgz
    parallel([
      (cb) => wreck.get(url + 'utf7', cb),
      (cb) => wreck.get(url + 'utf7/index.json', cb),
      (cb) => wreck.get(url + 'utf7/-/utf7-1.0.0.tgz', cb)
    ], (err, res) => {
      expect(err).to.not.exist
      res.forEach((r) => {
        expect(r[0].statusCode).to.equal(200)
      })
      done()
    })
  })
})
