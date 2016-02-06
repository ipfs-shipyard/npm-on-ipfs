/* globals before, after, it, describe */

const assert = require('assert')
const mockery = require('mockery')

const json = {
  versions: {
    1: {
      dist: {
        tarball: 'http://example.com/foo/1/foo-1.tgz',
        shasum: '1abc123'
      }
    },
    2: {
      dist: {
        tarball: 'http://example.com/foo/2/foo-2.tgz',
        shasum: '2abc123'
      }
    }
  }
}

const options = {
  dir: '/mirror',
  limit: 2
}

var util

describe('util', () => {
  before((done) => {
    mockery.registerMock('./verify.js', {
      verify: (obj, callback) => {
        obj.verified = true
        callback()
      }
    })
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })
    util = require('../../src/npm-pipe-ipfs/util')
    done()
  })
  after((done) => {
    mockery.deregisterAll()
    mockery.disable()
    done()
  })

  it('should export an object with methods', (done) => {
    assert.equal(typeof util, 'object')
    assert.equal(typeof util.check, 'function')
    done()
  })
  it('check method, tarballs verified', (done) => {
    util.check(json, options, (err, d) => {
      assert.ifError(err)
      assert(d[0].verified)
      assert.equal(d[0].path, '/foo/1/foo-1.tgz')
      assert.equal(d[0].tarball, '/foo/1/foo-1.tgz')
      assert(d[1].verified)
      assert.equal(d[1].path, '/foo/2/foo-2.tgz')
      assert.equal(d[1].tarball, '/foo/2/foo-2.tgz')
      done()
    })
  })
  it('check method early exit (versions)', (done) => {
    util.check({}, options, (err, d) => {
      assert.ifError(err)
      assert(!d)
      done()
    })
  })
  it('check method early exit (tarballs)', (done) => {
    util.check({
      versions: {1: {}, 2: {}}
    }, options, (err, d) => {
      assert.ifError(err)
      assert(!d)
      done()
    })
  })
})
