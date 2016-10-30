/* eslint-env mocha */
'use strict'

const assert = require('assert')
const mockery = require('mockery')
const async = require('async')

const testError = new Error()
const memblob = require('abstract-blob-store')('/tests')

describe('module-writer', () => {
  let writer

  before(() => {
    const verifier = {
      verify (info, callback) {
        if (info.makeError) {
          callback(testError)
        } else {
          callback()
        }
      }
    }

    mockery.registerMock('../config.js', {
      writeLimit: 2
    })

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    const Writer = require('../src/ipfs-npm/registry/clone/module-writer')
    writer = new Writer(memblob, verifier)
  })

  after(() => {
    mockery.disable()
    mockery.deregisterAll()
  })

  describe('putJSON', () => {
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

    it('early exit (store error): no files saved, err returned', (done) => {
      memblob.data = {}
      const info = {
        json: {
          name: 'foo'
        }
      }
      const fun = memblob.createWriteStream
      let count = 0
      memblob.createWriteStream = (obj, cb) => {
        count++
        cb(new Error('fail'))
        return {write () {}, end () {}}
      }

      writer.putJSON(info, (err) => {
        assert.equal(count, 4)
        assert.deepEqual(memblob.data, {})
        assert.equal(err.message, 'fail')
        memblob.createWriteStream = fun
        done()
      })
    })

    it('success', (done) => {
      memblob.data = {}
      const info = {
        json: {name: 'foopackage'},
        seq: 97,
        latestSeq: 42,
        versions: [{
          json: {name: 'foopackage', cool: true},
          version: '1.0.0'
        }, {
          json: {name: 'foopackage', cool: false},
          version: '2.0.0'
        }, {
          version: '3.0.0'
        }, {
          json: {why: 'me'},
          version: '3.1.1'
        }]
      }
      const toBlob = (obj) => JSON.stringify(obj, null, 4) + '\n'

      writer.putJSON(info, (err) => {
        assert.ok(!err)
        assert.deepEqual(
          memblob.data['foopackage/index.json'],
          toBlob({name: 'foopackage'})
        )
        assert.deepEqual(
          memblob.data['foopackage/1.0.0/index.json'],
          toBlob({name: 'foopackage', cool: true})
        )
        assert.deepEqual(
          memblob.data['foopackage/2.0.0/index.json'],
          toBlob({name: 'foopackage', cool: false})
        )
        assert.deepEqual(
          memblob.data['foopackage/3.0.0/index.json'],
          undefined
        )
        assert.deepEqual(
          memblob.data['foopackage/3.1.1/index.json'],
          toBlob({why: 'me', name: 'foopackage'})
        )
        done()
      })
    })

    it('parallel writes', (done) => {
      const packages = [
        'first',
        'second',
        'third',
        'awesome',
        'last'
      ]
      async.forEach(packages, (name, cb) => {
        writer.putJSON({
          json: {name: name}
        }, cb)
      }, (err) => {
        if (err) {
          return done(err)
        }
        packages.forEach((name) => {
          assert.deepEqual(
            memblob.data[`${name}/index.json`],
            JSON.stringify({name: name}, null, 4) + '\n'
          )
        })
        done()
      })
    })
  })

  describe('saveTarballs', () => {
    it('success', (done) => {
      const tarballs = [{
        path: 'package1'
      }, {
        path: 'package2'
      }]

      writer.saveTarballs(tarballs, done)
    })
  })
})
