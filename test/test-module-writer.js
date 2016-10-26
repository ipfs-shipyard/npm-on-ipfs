/* eslint-env mocha */
'use strict'

const assert = require('assert')
const mockery = require('mockery')

const testError = new Error()
const memblob = require('abstract-blob-store')('/tests')

describe('module-writer', () => {
  let writer

  before(() => {
    const verifier = {
      verify (obj, callback) {
        obj.verified = true
        if (obj.makeError) {
          callback(testError)
        } else {
          callback()
        }
      }
    }

    mockery.registerMock('./config.js', {
      dir: __dirname,
      limit: 2,
      blobstore: memblob
    })

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    writer = require('../src/ipfs-npm/registry-clone/module-writer')(memblob, verifier)
  })

  after(() => {
    mockery.disable()
    mockery.deregisterAll()
  })

  it('should export an object with methods', () => {
    assert.equal(typeof writer, 'object')
    ;['putJSON', 'saveTarballs'].forEach((name) => {
      assert.equal(typeof writer[name], 'function')
    })
  })

  describe('putJSON', () => {
    let info

    before((done) => {
      info = {
        json: {name: 'foopackage'},
        seq: 97,
        latestSeq: 42,
        versions: [
          {
            json: {name: 'foopackage'},
            version: '1.0.0'
          },
          {
            json: {name: 'foopackage'},
            version: '2.0.0'
          }
        ]
      }
      writer.putJSON(info, done)
    })

    it('early exit (no top level name): no files saved', (done) => {
      memblob.data = {}
      const info = {
        json: {}
      }
      writer.putJSON(info, () => {
        assert.deepEqual(memblob.data, {})
        done()
      })
    })

    it('early exit (error): no files saved, err returned', (done) => {
      memblob.data = {}
      const info = {
        json: {
          name: 'foo',
          error: 'anError'
        }
      }
      writer.putJSON(info, (err) => {
        assert.deepEqual(memblob.data, {})
        assert.equal(err, 'anError')
        done()
      })
    })

    it('success', (done) => {
      memblob.data = {}
      const info = {
        json: {name: 'foopackage'}
      }
      writer.putJSON(info, (err) => {
        assert.ok(!err)
        assert.deepEqual(memblob.data, {
          'foopackage/index.json': JSON.stringify({name: 'foopackage'}, null, 4) + '\n'
        })
        done()
      })
    })
  })
})
