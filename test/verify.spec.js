/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('sinon-chai'))
const sinon = require('sinon')

const expect = chai.expect
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const Writable = require('stream').Writable

function clearData (done) {
  memblob.data = {'existing.tgz': 'asdf'}
  done()
}

const memblob = require('abstract-blob-store')()

describe.only('Verifier', () => {
  let verifier

  before(() => {
    const Verifier = require('../src/ipfs-npm/registry/clone/verifier')
    verifier = new Verifier(memblob)
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

    it("checks hash and doesn't call update", (done) => {
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

  describe('.update', () => {
    it('errors on missing tarball', (done) => {
      verifier.update({path: 'mypath', shasum: 'checksum'}, (err) => {
        expect(err).to.be.an('error')
        expect(err.message).be.eql('insufficient data')
        done()
      })
    })

    it('errors on missing path', (done) => {
      verifier.update({tarball: 'mypath.tgz', shasum: 'checksum'}, (err) => {
        expect(err).to.be.an('error')
        expect(err.message).be.eql('insufficient data')
        done()
      })
    })

    it('errors on missing shasum', (done) => {
      verifier.update({tarball: 'mypath.tgz', path: 'mypath'}, (err) => {
        expect(err).to.be.an('error')
        expect(err.message).be.eql('insufficient data')
        done()
      })
    })

    it('errors on invalid sha checksum', (done) => {
      const info = {
        path: '/module-best-practices/-/module-best-practices-1.1.23.tgz',
        tarball: 'module-best-practices-1.1.23.tgz',
        shasum: '_e72aadf604d52983adaa087f7bf3371ef6bd6ac1'
      }

      verifier.update(info, (err) => {
        expect(err).to.be.an('error')
        expect(err.message).to.match(/failed to verify shasum/)
        done()
      })
    })

    it('errors on non existent path', (done) => {
      const info = {
        path: '/module-best-practices/-/module-best-practices-0.0.0.tgz',
        tarball: 'module-best-practices-0.0.0.tgz',
        shasum: 'e72aadf604d52983adaa087f7bf3371ef6bd6ac1'
      }

      verifier.update(info, (err) => {
        expect(err).to.be.an('error')
        expect(err.message).to.match(/failed to download/)
        done()
      })
    })

    it('errors on failed write to blob store', (done) => {
      const info = {
        path: '/module-best-practices/-/module-best-practices-1.1.23.tgz',
        tarball: 'module-best-practices-1.1.23.tgz',
        shasum: 'e72aadf604d52983adaa087f7bf3371ef6bd6ac1'
      }

      sinon
        .stub(memblob, 'createWriteStream', (file, cb) => {
          process.nextTick(() => cb(new Error('fail')))
          return Writable()
        })

      verifier.update(info, (err) => {
        expect(err).to.be.an('error')
        expect(err.message).to.match(/failed to save/)
        memblob.createWriteStream.restore()
        done()
      })
    })

    it('stores the fetched tarball and data', (done) => {
      memblob.data = {}
      const info = {
        path: '/module-best-practices/-/module-best-practices-1.1.23.tgz',
        tarball: 'module-best-practices-1.1.23.tgz',
        shasum: 'e72aadf604d52983adaa087f7bf3371ef6bd6ac1'
      }

      verifier.update(info, (err) => {
        expect(err).to.not.exist
        expect(memblob.data).to.have.key('module-best-practices-1.1.23.tgz')

        expect(
          memblob.data['module-best-practices-1.1.23.tgz']
        ).to.be.eql(
          fs.readFileSync(path.join(__dirname, 'fixtures/module-best-practices-1.1.23.tgz'))
        )
        done()
      })
    })
  })
})
