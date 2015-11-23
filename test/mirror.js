/* global it, describe, before, after */
var rimraf = require('rimraf')
var ncp = require('ncp')
var request = require('request')
var mockery = require('mockery')
var path = require('path')
var assert = require('assert')

var regDir = path.join(__dirname, 'registry')

describe('mirror', function () {
  var mirror, port, spawnArgs
  this.timeout(10000)
  before(function (done) {
    mockery.enable({
      warnOnUnregistered: false,
      useCleanCache: true,
      warnOnReplace: false
    })
    mockery.registerMock('davlog', {
      init: function () {},
      info: function () {}
    })
    mockery.registerMock('child_process', {
      spawn: function () {
        spawnArgs = [].slice.call(arguments)
        return {}
      }
    })
    mockery.registerMock('mdns', {
      tcp: function (type) {
        return 'TYPE:' + type
      },
      createAdvertisement: function () {
        return {
          start: function () {
          }
        }
      }
    })
    rimraf(path.join(regDir, 'foobartestthing'), function () {
      // process.argv[3] = 'test/registry'
      mirror = require('../src/')({
        outputDir: 'test/registry',
        blobStore: null,
        clone: true
      })
      ncp(path.join(__dirname, 'foobartestthing'), path.join(__dirname, 'registry', 'foobartestthing'), function () {
        setTimeout(function () {
          port = mirror.port
          done()
        }, 500) // waiting for server to spin up
      })
    })
  })
  after(function (done) {
    rimraf(path.join(regDir, 'foobartestthing'), function () {
      mirror.close()
      mockery.deregisterAll()
      mockery.disable()
      done()
    })
  })

  it('should be running registry-static', function () {
    assert.deepEqual(spawnArgs, [
      path.resolve(require.resolve('registry-static'), '../../bin/registry-static'),
      ['-o', 'test/registry', '-d', 'localhost'],
      {stdio: 'inherit'}
    ])
  })

  it('should serve up main index.json', function (done) {
    request.get('http://127.0.0.1:' + port, {json: true}, function (err, res, body) {
      assert.ifError(err)
      assert.equal(res.headers.server, 'reginabox')
      assert.equal(res.statusCode, 200)
      assert.equal(body, 'Welcome\n')
      done()
    })
  })

  it('should serve up static files from registry', function (done) {
    request.get('http://127.0.0.1:' + port + '/foobartestthing/thing.txt', function (err, res, body) {
      assert.ifError(err)
      assert.equal(res.headers.server, 'reginabox')
      assert.equal(res.statusCode, 200)
      assert.equal(body, 'test stuff\n')
      done()
    })
  })

  it('should serve up package index.json, and modify the tarball', function (done) {
    request.get('http://127.0.0.1:' + port + '/foobartestthing/', {json: true}, function (err, res, body) {
      assert.ifError(err)
      assert.equal(res.headers.server, 'reginabox')
      assert.equal(res.statusCode, 200)
      assert.deepEqual(body, {testing: 'json'})
      done()
    })
  })

  it('should listen on a specified port', function (done) {
    var m = require('../src/')({
      outputDir: 'test/registry',
      blobStore: null,
      clone: true,
      port: 9999
    })
    m.server.on('listening', function () {
      assert.equal(m.port, 9999)
      m.close()
      done()
    })
  })

  it('should listen on a specified host', function (done) {
    var m = require('../src/')({
      outputDir: 'test/registry',
      blobStore: null,
      clone: true,
      host: '127.0.0.1'
    })

    m.server.on('listening', function () {
      assert.equal(m.server.address().address, '127.0.0.1')
      m.close()
      done()
    })
  })
})
