/* globals describe, it */

'use strict'

const expect = require('chai').expect
const mirror = require('../../src').mirror
const wreck = require('wreck')

describe('mirror', () => {
  const url = 'http://127.0.0.1:' + 9040 + '/'

  it('start serving npm from IPFS', function (done) {
    this.timeout(50000)

    var options = {
      blobStore: {
        baseDir: '/npm-registry',
        host: '127.0.0.1',
        port: 5001
      },
      port: 9040
    }

    mirror(options, () => {
      done()
    })
  })

  it('index.json', (done) => {
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
