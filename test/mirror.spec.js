/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const Readable = require('stream').Readable
const request = require('request-promise-native')
const createBlobStore = require('./fixtures/create-blob-store')
const {
  createTestServer,
  destroyTestServers
} = require('./fixtures/test-server')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect

const foundStream = (content) => {
  return () => {
    const stream = new Readable()
    stream._read = () => {}

    setTimeout(() => {
      stream.emit('data', content)
      stream.emit('end')
    }, 500)

    return stream
  }
}

const missingStream = (path) => {
  return () => {
    const stream = new Readable()
    stream._read = () => {}

    setTimeout(() => {
      stream.emit('error', new Error(`${path} does not exist`))
    }, 500)

    return stream
  }
}

const mockContent = (blobStore, path, content) => {
  blobStore.createReadStream.withArgs(path).callsFake(foundStream(content))
}

const mockMissingThenFoundContent = (blobStore, path, content) => {
  blobStore.createReadStream
    .withArgs(path)
    .onFirstCall().callsFake(missingStream(path))
    .onSecondCall().callsFake(foundStream(content))
}

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
      mirrorHost: '127.0.0.1'
    })

    const content = 'manifest content'

    mockContent(blobStore, '/my-module/index.json', content)

    const result = await request.get(`http://127.0.0.1:${app.address().port}/my-module`)

    expect(result).to.equal(content)
  })

  it('should serve a tarball', async () => {
    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1'
    })

    const content = 'tarball content'

    mockContent(blobStore, '/my-module/-/1.0.0/my-module.tgz', content)

    const result = await request.get(`http://127.0.0.1:${app.address().port}/my-module/-/1.0.0/my-module.tgz`)

    expect(result).to.equal(content)
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

    mockMissingThenFoundContent(blobStore, '/my-module/index.json', data)

    const result = await request.get(`http://127.0.0.1:${app.address().port}/my-module`)

    expect(result).to.equal(data)
  })

  it('should download a missing tarball from an existing module', async () => {
    const tarballPath = '/my-module/-/1.0.0/my-module-1.0.0.tgz'
    const tarballContent = 'tarball content'
    let data

    const server = await createTestServer((server) => {
      const versions = [{
        tarball: `http://127.0.0.1:${server.address().port}${tarballPath}`,
        shasum: '123'
      }]
      data = JSON.stringify({
        name: 'my-module',
        versions
      })

      return {
        '/my-module': data,
        [tarballPath]: tarballContent
      }
    })

    app = await mirror({
      mirrorProtocol: 'http',
      mirrorPort: 0,
      mirrorHost: '127.0.0.1',
      mirrorRegistry: `http://127.0.0.1:${server.address().port}`
    })

    mockContent(blobStore, '/my-module/index.json', data)
    mockMissingThenFoundContent(blobStore, tarballPath, tarballContent)

    await request.get(`http://127.0.0.1:${app.address().port}/my-module`)
    const result = await request.get(`http://127.0.0.1:${app.address().port}${tarballPath}`)

    expect(result).to.equal(tarballContent)
  })
})
