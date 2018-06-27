/* globals describe, it, before */

'use strict'

const expect = require('chai').expect
const mirror = require('../../src').mirror
const wreck = require('wreck')

describe('mirror', () => {
  const url = 'http://127.0.0.1:' + 9040 + '/'

  before(function (done) {
    this.timeout(50000)

    mirror(done)
  })

  it('get module utf7', () => {
    // requests that cli makes:
    // npm http request GET http://localhost:9876/utf7
    // npm http fetch GET http://localhost:9876/utf7/-/utf7-1.0.0.tgz
    return wreck.get(url + 'utf7')
      .then(({res}) => {
        expect(res.statusCode).to.equal(200)
      })
      .then(() => wreck.get(url + 'utf7/index.json'))
      .then(({res}) => {
        expect(res.statusCode).to.equal(200)
      })
      .then(() => wreck.get(url + 'utf7/-/utf7-1.0.0.tgz'))
      .then(({res}) => {
        expect(res.statusCode).to.equal(200)
      })
  })
})
