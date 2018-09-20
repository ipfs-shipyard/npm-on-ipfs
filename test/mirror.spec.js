/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const request = require('request-promise-native')
const createBlobStore = require('./fixtures/create-blob-store')
const {
  createTestServer,
  destroyTestServers
} = require('./fixtures/test-server')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const pkg = require('../package.json')

describe('mirror', () => {
  let app
  let mirror
  let blobStore

  beforeEach(() => {
    blobStore = createBlobStore()
    mock('ipfs-blob-store', sinon.stub().returns(blobStore))
    mirror = mock.reRequire('../src/core/mirror')
  })

  afterEach(async () => {
    mock.stopAll()

    await destroyTestServers()

    if (app && app.close) {
      await new Promise((resolve) => app.close(resolve))
    }
  })

  it('should serve a manifest', async () => {
    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: 'http://127.0.0.1:1234'
    })

    const content = 'manifest content'
    const stream = blobStore.createWriteStream('/my-module/index.json')
    stream.end(content)

    const result = await request.get(`http://127.0.0.1:${app.address().port}/my-module`)

    expect(result).to.equal(content)
  })

  it('should serve a tarball', async () => {
    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: 'http://127.0.0.1:1234'
    })

    const content = 'tarball content'

    const stream = blobStore.createWriteStream('/my-module/-/1.0.0/my-module.tgz')
    stream.end(content)

    const result = await request.get(`http://127.0.0.1:${app.address().port}/my-module/-/1.0.0/my-module.tgz`)

    expect(result).to.equal(content)
  })

  it('should serve some basic info', async () => {
    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: 'http://127.0.0.1:1234'
    })

    const result = JSON.parse(await request.get(`http://127.0.0.1:${app.address().port}`))

    expect(result.name).to.equal(pkg.name)
    expect(result.version).to.equal(pkg.version)
  })

  it('should download a manifest from a missing module', async () => {
    let data

    const server = await createTestServer((server) => {
      const versions = []
      data = JSON.stringify({
        name: 'my-module',
        versions
      })

      return {
        '/my-module': data
      }
    })

    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: `http://127.0.0.1:${server.address().port}`
    })

    const result = await request.get(`http://127.0.0.1:${app.address().port}/my-module`)

    expect(result.trim()).to.equal(data.trim())
  })

  it('should download a missing tarball from an existing module', async () => {
    const tarballPath = '/my-module/-/1.0.0/my-module-1.0.0.tgz'
    const tarballContent = 'tarball content'

    const server = await createTestServer({
      [tarballPath]: tarballContent
    })

    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: `http://127.0.0.1:${server.address().port}`
    })

    const result = await request.get(`http://127.0.0.1:${app.address().port}${tarballPath}`)

    expect(result).to.equal(tarballContent)
  })

  it('should download a manifest from a missing scoped module', async () => {
    let data

    const server = await createTestServer((server) => {
      const versions = []
      data = JSON.stringify({
        name: '@my-scope/my-module',
        versions
      })

      return {
        '/@my-scope/my-module': data
      }
    })

    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: `http://127.0.0.1:${server.address().port}`
    })

    const result = await request.get(`http://127.0.0.1:${app.address().port}/@my-scope%2fmy-module`)

    expect(result.trim()).to.equal(data.trim())
  })

  it('should proxy all other requests to the registry', async () => {
    let data = 'hello world'

    const server = await createTestServer((server) => {
      return {
        '/-/user/org.couchdb.user:dave': data
      }
    })

    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: `http://127.0.0.1:${server.address().port}`
    })

    const result = await request.put(`http://127.0.0.1:${app.address().port}/-/user/org.couchdb.user:dave`)

    expect(result.trim()).to.equal(data.trim())
  })
})
