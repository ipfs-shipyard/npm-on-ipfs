/* globals describe, it */

'use strict'

const expect = require('chai').expect
const mirror = require('../../src').mirror
const wreck = require('wreck')
const config = require('./../../src/config.js')

describe('mirror', () => {
  const url = 'http://127.0.0.1:' + 9040 + '/'

  it('start serving npm from IPFS', function (done) {
    this.timeout(50000)

    config.mirror.port = 9040

    mirror(done)
  })

  it('get module utf7', (done) => {
    // requests that cli makes:
    // npm http request GET http://localhost:9876/utf7
    // npm http fetch GET http://localhost:9876/utf7/-/utf7-1.0.0.tgz
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
