/*  */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const config = require('../src/core/config')
const createModuleUpdate = require('./fixtures/create-module-update')
const createWriteableStream = require('./fixtures/create-writeable-stream')
const {
  createTestServer,
  destroyTestServers
} = require('./fixtures/test-server')
const invoke = require('./fixtures/invoke')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect

describe('clone', () => {
  let clone
  let follow
  let blobStore

  beforeEach(() => {
    blobStore = {
      createWriteStream: sinon.stub(),
      createReadStream: sinon.stub(),
      exists: sinon.stub(),
      remove: sinon.stub()
    }
    follow = sinon.stub()
    mock('follow-registry', follow)
    clone = mock.reRequire('../src/core/clone')

    blobStore.createWriteStream
      .callsFake((path, callback) => {
        const stream = createWriteableStream()

        stream.end.callsFake(() => {
          setImmediate(callback)
        })

        return stream
      })
  })

  afterEach(async () => {
    mock.stopAll()

    await destroyTestServers()
  })

  it('should eagerly download a new module', async () => {
    const tarballPath = '/new-module/-/1.0.0/new-module-1.0.0.tar.gz'
    const tarballContent = 'I am some binary'

    const server = await createTestServer({
      [tarballPath]: tarballContent
    })

    const cloner = clone(config({
      eagerDownload: true
    }), blobStore)

    const handler = follow.getCall(0).args[0].handler
    const versions = [{
      tarball: `http://127.0.0.1:${server.address().port}${tarballPath}`,
      shasum: '123'
    }]
    const data = createModuleUpdate('new-module', versions)

    blobStore.exists.withArgs(tarballPath).callsArgWithAsync(1, null, false)

    invoke(handler, data)

    return new Promise((resolve, reject) => {
      cloner.once('processed', (event) => {
        try {
          expect(event.json.name).to.equal('new-module')
          expect(event.downloaded.length).to.equal(1)
          expect(event.downloaded[0].tarball).to.equal(`http://127.0.0.1:${server.address().port}${tarballPath}`)
          expect(blobStore.createWriteStream.calledWith('new-module/index.json')).to.be.ok()
          expect(blobStore.exists.calledWith(tarballPath)).to.be.ok()
          expect(blobStore.createWriteStream.calledWith(tarballPath)).to.be.ok()
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

    const cloner = clone(config({
      eagerDownload: false
    }), blobStore)

    const handler = follow.getCall(0).args[0].handler
    const versions = [{
      tarball: `http://127.0.0.1:${server.address().port}${tarballPath}`,
      shasum: '123'
    }]
    const data = createModuleUpdate('new-module', versions)

    blobStore.exists.withArgs(tarballPath).callsArgWithAsync(1, null, false)

    invoke(handler, data)

    return new Promise((resolve, reject) => {
      cloner.once('processed', (event) => {
        try {
          expect(event.json.name).to.equal('new-module')
          expect(event.downloaded.length).to.equal(0)
          expect(blobStore.createWriteStream.calledWith('new-module/index.json')).to.be.ok()
          expect(blobStore.exists.calledWith(tarballPath)).to.not.be.ok()
          expect(blobStore.createWriteStream.calledWith(tarballPath)).to.not.be.ok()
        } catch (error) {
          return reject(error)
        }

        resolve()
      })
    })
  })
})
