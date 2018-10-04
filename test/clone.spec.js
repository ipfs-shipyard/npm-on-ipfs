/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const config = require('../src/core/config')
const createIpfs = require('./fixtures/create-ipfs')
const {
  createTestServer,
  destroyTestServers
} = require('./fixtures/test-server')
const invoke = require('./fixtures/invoke')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')
const saveManifest = require('../src/core/utils/save-manifest')

const baseDir = '/commons-registry-clone-test'

describe('clone', function () {
  this.timeout(10000)
  let clone
  let follow
  let ipfs

  before(async () => {
    ipfs = await createIpfs()
  })

  after(async () => {
    await ipfs.stop()
  })

  beforeEach(async () => {
    follow = sinon.stub()
    mock('follow-registry', follow)
    clone = mock.reRequire('../src/core/clone')
  })

  afterEach(async () => {
    mock.stopAll()

    await destroyTestServers()
  })

  const options = (overrides = {}) => {
    return Object.assign({
      ipfsBaseDir: baseDir,
      eagerDownload: false,
      externalHost: 'registry-host',
      externalPort: 443,
      externalProtocol: 'https',
      ipfsFlush: true
    }, overrides)
  }

  it('should eagerly download a new module', async () => {
    const tarballPath = '/new-module/-/new-module-1.0.0.tgz'
    const tarballContent = 'I am some binary'

    const server = await createTestServer({
      [tarballPath]: tarballContent
    })

    const cloner = clone(config(options({
      eagerDownload: true
    })), ipfs)

    const handler = follow.getCall(0).args[0].handler
    const data = {
      json: {
        name: 'new-module',
        _rev: '12345',
        versions: {
          '0.0.1': {
            dist: {
              tarball: `http://127.0.0.1:${server.address().port}${tarballPath}`,
              shasum: '3f9f726832b39c2cc7ac515c8a6c97b94b608b0e'
            }
          }
        }
      }
    }

    invoke(handler, data)

    return new Promise((resolve, reject) => {
      cloner.once('processed', (event) => {
        try {
          expect(event.name).to.equal('new-module')
          expect(Object.keys(event.versions).length).to.equal(1)
          expect(event.versions['0.0.1'].dist.source).to.equal(`http://127.0.0.1:${server.address().port}${tarballPath}`)
          expect(event.versions['0.0.1'].dist.tarball).to.equal(`https://registry-host/new-module/-/new-module-0.0.1.tgz`)
        } catch (error) {
          return reject(error)
        }

        resolve()
      })
    })
  })

  it('should not eagerly download a new module', async () => {
    const tarballPath = '/new-module/-/1.0.0/new-module-1.0.0.tar.gz'
    const tarballContent = 'I am some binary'

    const server = await createTestServer({
      [tarballPath]: tarballContent
    })

    const cloner = clone(config(options({
      eagerDownload: false
    })), ipfs)

    const handler = follow.getCall(0).args[0].handler
    const data = {
      json: {
        name: 'new-module',
        _rev: '12345',
        versions: {
          '0.0.1': {
            dist: {
              tarball: `http://127.0.0.1:${server.address().port}${tarballPath}`,
              shasum: '123'
            }
          }
        }
      }
    }

    invoke(handler, data)

    return new Promise((resolve, reject) => {
      cloner.once('processed', (event) => {
        try {
          expect(event.name).to.equal('new-module')
        } catch (error) {
          return reject(error)
        }

        resolve()
      })
    })
  })

  it('should survive an invalid update', (done) => {
    clone(config(options()), ipfs)

    const handler = follow.getCall(0).args[0].handler
    const data = {}

    handler(data, () => {
      done()
    })
  })

  it('should survive npm 503ing', (done) => {
    clone(config(options()), ipfs)

    const handler = follow.getCall(0).args[0].handler
    const data = {
      json: '<html><body><h1>503 Service Unavailable</h1>\nNo server is available to handle this request.\n</body></html>\n\n',
      versions: [],
      tarballs: [],
      seq: 283813
    }

    handler(data, () => {
      done()
    })
  })

  it('should survive npm 504ing', (done) => {
    clone(config(options()), ipfs)

    const handler = follow.getCall(0).args[0].handler
    const data = {
      json: '<html><body><h1>504 Gateway Time-out</h1>\nThe server didn\'t respond in time.\n</body></html>\n\n',
      versions: [],
      tarballs: [],
      seq: 283813
    }

    handler(data, () => {
      done()
    })
  })

  it('should survive npm 404ing', (done) => {
    clone(config(options()), ipfs)

    const handler = follow.getCall(0).args[0].handler
    const data = {
      json: {
        error: 'not_found',
        reason: 'missing'
      },
      versions: [],
      tarballs: [],
      seq: 50390
    }

    handler(data, () => {
      done()
    })
  })

  it('should not download a tarball that already exists', async () => {
    const moduleName = `my-module-${hat()}`
    const tarballPath = `/${moduleName}/-/${moduleName}-1.0.0.tar.gz`
    const manifest = {
      name: moduleName,
      _rev: '12345',
      versions: {
        '1.0.0': {
          dist: {
            tarball: `http://127.0.0.1:8080${tarballPath}`,
            source: `http://127.0.0.1:8080${tarballPath}`,
            cid: 'QmZVQm5euZa69LtUFt8HuuBPSpLYMxcxACh6F5M8ZqpbR9',
            shasum: '123'
          }
        }
      }
    }

    await saveManifest(manifest, ipfs, {
      store: {
        baseDir,
        flush: true
      }
    })

    const cloner = clone(config(options({
      eagerDownload: true
    })), ipfs)

    const handler = follow.getCall(0).args[0].handler
    const data = {
      json: {
        name: moduleName,
        _rev: '12345',
        versions: {
          '1.0.0': {
            dist: {
              tarball: `http://127.0.0.1:8080${tarballPath}`,
              shasum: '123'
            }
          }
        }
      }
    }

    invoke(handler, data)

    return new Promise((resolve, reject) => {
      cloner.once('processed', (event) => {
        try {
          expect(event.name).to.equal(moduleName)
        } catch (error) {
          return reject(error)
        }

        resolve()
      })
    })
  })
})
