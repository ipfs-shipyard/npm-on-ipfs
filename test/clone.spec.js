/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('sinon-chai'))
const sinon = require('sinon')
const mockery = require('mockery')
const async = require('async')

const expect = chai.expect

const stubs = {
  follow: sinon.stub(),
  memblob: require('abstract-blob-store')
}
const config = require('../src/ipfs-npm/config')
const changeFixture = require('./fixtures/change0.json')

describe('RegistryClone', () => {
  let clone
  let fakeApi

  before(() => {
    mockery.registerMock('follow-registry', stubs.follow)

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })
    fakeApi = {}
    clone = require('../src/ipfs-npm/registry/clone')
  })

  after(() => {
    mockery.disable()
    mockery.deregisterAll()
  })

  describe('options', () => {
    it('defaults', () => {
      sinon.spy(stubs, 'memblob')
      clone(fakeApi, {store: stubs.memblob})

      const callRes = stubs.memblob.args[0][0]
      expect(callRes).to.have.property('flush', true)
      expect(callRes).to.have.property('host', '127.0.0.1')
      expect(callRes).to.have.property('port', 5001)
      expect(callRes).to.have.property('baseDir', '/npm-registry/')

      stubs.memblob.restore()
    })

    it('sets flush', () => {
      sinon.spy(stubs, 'memblob')
      clone(fakeApi, {
        store: stubs.memblob,
        flush: false
      })

      const callRes = stubs.memblob.args[0][0]
      expect(callRes).to.have.property('flush', false)
      stubs.memblob.restore()
    })

    it('sets custom ipfs url', () => {
      sinon.spy(stubs, 'memblob')
      clone(fakeApi, {
        store: stubs.memblob,
        url: '/ip4/192.168.0.1/tcp/1234'
      })

      const callRes = stubs.memblob.args[0][0]
      expect(callRes).to.have.property('host', '192.168.0.1')
      expect(callRes).to.have.property('port', 1234)
      stubs.memblob.restore()
    })
  })

  describe('run', () => {
    beforeEach(() => {
      stubs.follow.reset()
    })

    it('follows with the correct config', () => {
      clone(fakeApi, {store: stubs.memblob})
      const conf = stubs.follow.args[0][0]

      expect(conf).to.have.property('seqFile', config.seqFile)
      expect(conf).to.have.property('registry', config.registry)
      expect(conf).to.have.property('skim', config.skim)
      expect(conf).to.have.property('handler')
    })

    it('with clean', () => {

    })
  })

  describe('change', () => {
    beforeEach(() => {
      stubs.follow.reset()
    })

    it('handles a regular change', (done) => {
      clone(fakeApi, {store: stubs.memblob})
      const handler = stubs.follow.args[0][0].handler

      handler(changeFixture, (err) => {
        expect(err).to.not.exist
        // TODO: assert memblob data
        done()
      })
    })

    describe('bail', () => {
      it('invalid json', (done) => {
        clone(fakeApi, {store: stubs.memblob})
        const handler = stubs.follow.args[0][0].handler

        handler({json: 'w'}, done)
      })

      it('missing name', (done) => {
        clone(fakeApi, {store: stubs.memblob})
        const handler = stubs.follow.args[0][0].handler

        handler({json: {hello: 'world'}}, done)
      })

      it('no versions', (done) => {
        clone(fakeApi, {store: stubs.memblob})
        const handler = stubs.follow.args[0][0].handler
        const data = JSON.parse(JSON.stringify(changeFixture))
        data.versions = []
        handler(data, done)
      })

      it('failed saveTarballs', (done) => {
        clone(fakeApi, {store: stubs.memblob})
        const handler = stubs.follow.args[0][0].handler
        const data = JSON.parse(JSON.stringify(changeFixture))
        data.error = new Error('fail')
        handler(data, done)
      })

      it('calls flush after flushInterval changes', (done) => {
        fakeApi = {
          files: {
            flush: sinon.stub().yields()
          }
        }

        clone(fakeApi, {flushInterval: 5, flush: false})
        const handler = stubs.follow.args[0][0].handler
        const change = (id) => {
          return {
            json: {
              id: `hello${id}`,
              versions: []
            }
          }
        }

        async.series([
          (cb) => handler(change(1), cb),
          (cb) => handler(change(2), cb),
          (cb) => handler(change(3), cb),
          (cb) => handler(change(4), cb),
          (cb) => {
            expect(fakeApi.files.flush).to.not.have.been.called
            cb()
          },
          (cb) => handler(change(5), cb),
          (cb) => {
            expect(fakeApi.files.flush).to.have.been.calledOnce
            cb()
          },
          (cb) => handler(change(6), cb),
          (cb) => handler(change(7), cb),
          (cb) => handler(change(8), cb),
          (cb) => handler(change(9), cb),
          (cb) => handler(change(10), cb)
        ], (err) => {
          expect(err).to.not.exist
          expect(fakeApi.files.flush).to.have.been.calledTwice
          done()
        })
      })
    })
  })

  describe('updateLatestSeq', () => {

  })
})
