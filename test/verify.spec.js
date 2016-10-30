/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('sinon-chai'))
const sinon = require('sinon')

const expect = chai.expect
const mockery = require('mockery')
const crypto = require('crypto')
const fs = require('fs')

function clearData (done) {
  memblob.data = {'existing.tgz': 'asdf'}
  done()
}

const memblob = require('abstract-blob-store')()

describe('verify', () => {
  let verifier

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })
    const Verifier = require('../src/ipfs-npm/registry/clone/verifier')
    verifier = new Verifier(memblob)
  })

  after(() => {
    mockery.deregisterAll()
    mockery.disable()
  })

  describe('.verify', () => {
    before((done) => {
      sinon.spy(verifier, 'update')
      const shasum = crypto.createHash('sha1')
      shasum.setEncoding('hex')
      fs.createReadStream(__filename)
        .on('end', function () {
          shasum.end()
          done()
        })
        .pipe(shasum)
    })

    beforeEach(clearData)

    it("checks hash and does't call update", (done) => {
      const info = {
        path: '/the/path/1',
        tarball: 'existing.tgz',
        shasum: '3da541559918a808c2402bba5012f6c60b27661c'
      }

      verifier.verify(info, (err, d) => {
        expect(err).to.not.exist
        expect(verifier.update).to.not.have.been.called
        done()
      })
    })

    it('with non-existent tarball, update was called', (done) => {
      const info = {
        path: '/module-best-practices/-/module-best-practices-1.1.23.tgz',
        tarball: 'module-best-practices-1.1.23.tgz',
        shasum: 'e72aadf604d52983adaa087f7bf3371ef6bd6ac1'
      }

      verifier.verify(info, (err, d) => {
        expect(err).to.not.exist
        expect(verifier.update).to.have.been.calledOnce
        done()
      })
    })
  })
})
