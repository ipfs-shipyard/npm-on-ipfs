/* globals describe, before, after, it */

'use strict'

const assert = require('assert')
const mockery = require('mockery')

const testError = new Error()
const memblob = require('abstract-blob-store')('/tests')

let files

describe('files', () => {
  before((done) => {
    mockery.registerMock('./verify', {
      verify: (obj, callback) => {
        obj.verified = true
        if (obj.makeError) {
          callback(testError)
        } else {
          callback()
        }
      }
    })
    mockery.registerMock('../config', {
      dir: __dirname,
      limit: 2,
      blobstore: memblob,
      log: () => {}
    })
    mockery.registerMock('./hooks', {
      afterTarball: (info, callback, callback2) => {
        info.afterTarballCalled = true
        info.callbacksEqual = callback === callback2
        callback()
      },
      tarball: (info, callback, success) => {
        info.tarballCalled = true
        info.tarballPathCorrect = info.tarball === info.path
        success()
      },
      indexJson: (info, callback, success) => {
        info.indexJsonCalled = true
        if (info.makeError) {
          callback(testError)
        } else {
          success()
        }
      },
      versionJson: (info, callback, success) => {
        info.versionJsonCalled = true
        success()
      }
    })
    mockery.registerMock('./ibs', memblob)
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })
    files = require('../../src/npm-pipe-ipfs/files')
    done()
  })

  after((done) => {
    mockery.disable()
    mockery.deregisterAll()
    done()
  })

  it('should export an object with methods', (done) => {
    assert.equal(typeof files, 'object')
    ;['saveJSON', 'saveTarballs'].forEach((name) => {
      assert.equal(typeof files[name], 'function')
    })
    done()
  })

  describe('saveJSON', () => {
    var info
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
      files.saveJSON(info, done)
    })

    it('indexJson hook called', (done) => {
      assert(info.indexJsonCalled)
      done()
    })

    it('versionJson hook called', (done) => {
      assert(info.versions[0].versionJsonCalled)
      assert(info.versions[1].versionJsonCalled)
      done()
    })

    it('early exit (no top level name): no hooks called, no files saved', (done) => {
      memblob.data = {}
      const info = {
        json: {}
      }
      files.saveJSON(info, () => {
        assert.deepEqual(memblob.data, {})
        assert(!info.indexJsonCalled)
        done()
      })
    })

    it('early exit (error): no hooks called, no files saved, err returned', (done) => {
      memblob.data = {}
      const info = {
        json: {
          name: 'foo',
          error: 'anError'
        }
      }
      files.saveJSON(info, (err) => {
        assert.deepEqual(memblob.data, {})
        assert(!info.indexJsonCalled)
        assert.equal(err, 'anError')
        done()
      })
    })

    it('early exit (putAllParts): err returned', (done) => {
      memblob.data = {}
      var info = {
        json: {name: 'foopackage'},
        makeError: true
      }
      files.saveJSON(info, (err) => {
        assert.deepEqual(memblob.data, [])
        assert(info.indexJsonCalled)
        assert.equal(err, testError)
        done()
      })
    })
  })
})
