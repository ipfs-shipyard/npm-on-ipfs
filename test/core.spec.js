/* eslint-env mocha */
'use strict'

const promisify = require('util').promisify
const mock = require('mock-require')
const request = require('request-promise')
const {
  createTestServer,
  destroyTestServers
} = require('./fixtures/test-server')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const createDagNode = promisify(require('ipld-dag-pb').DAGNode.create)
const UnixFS = require('ipfs-unixfs')
const pkg = require('../package.json')
const path = require('path')
const os = require('os')
const hat = require('hat')
const delay = require('promise-delay')

describe('core', function () {
  this.timeout(10000)
  const baseDir = '/commons-registry-test'
  let startMirror
  let mirror
  let mirrorUrl
  let upstreamModules = {}
  let options

  const serverOptions = (registry, options = {}) => {
    return Object.assign({}, {
      mirrorProtocol: 'http',
      mirrorHost: '127.0.0.1',
      mirrorRegistry: `http://127.0.0.1:${registry.address().port}`,
      requestRetries: 5,
      requestRetryDelay: 100,
      ipfsBaseDir: baseDir,
      requestTimeout: 1000,
      ipfsRepo: path.join(os.tmpdir(), hat()),
      ipfsFlush: true,
      registryUpdateInterval: 0
    }, options)
  }

  before(async () => {
    startMirror = mock.reRequire('../src/core')

    let registryServer = await createTestServer(upstreamModules)
    options = serverOptions(registryServer)

    mirror = await startMirror(options)

    options.mirrorPort = mirror.server.address().port

    mirrorUrl = `${options.mirrorProtocol}://${options.mirrorHost}:${options.mirrorPort}`
  })

  after(async function () {
    mock.stopAll()

    await destroyTestServers()

    if (mirror && mirror.stop) {
      await mirror.stop()
    }
  })

  it('should serve a manifest', async function () {
    const moduleName = `module-${hat()}`
    const content = JSON.stringify({
      _rev: '12345',
      name: moduleName,
      versions: {}
    })

    await mirror.app.locals.ipfs.files.write(`${baseDir}/${moduleName}`, Buffer.from(content), {
      parents: true,
      create: true,
      truncate: true
    })

    const result = await request({
      uri: `${mirrorUrl}/${moduleName}`
    })

    expect(result).to.equal(content)
  })

  it('should serve a tarball', async () => {
    const moduleName = `module-${hat()}`
    const tarballContent = 'tarball-content'
    const fsNode = UnixFS('file', Buffer.from(tarballContent))

    const node = await createDagNode(fsNode.marshal())

    await mirror.app.locals.ipfs.dag.put(node, {
      cid: node._cid
    })

    const manifest = JSON.stringify({
      _rev: '12345',
      name: moduleName,
      versions: {
        '1.0.0': {
          dist: {
            cid: node._cid.toBaseEncodedString()
          }
        }
      }
    })

    await mirror.app.locals.ipfs.files.write(`${baseDir}/${moduleName}`, Buffer.from(manifest), {
      parents: true,
      create: true,
      truncate: true
    })

    const result = await request({
      uri: `${mirrorUrl}/${moduleName}/-/${moduleName}-1.0.0.tgz`
    })

    expect(result).to.equal(tarballContent)
  })

  it('should serve some basic info', async () => {
    const result = JSON.parse(await request({
      uri: `${mirrorUrl}`
    }))

    expect(result.name).to.equal(pkg.name)
    expect(result.version).to.equal(pkg.version)
  })

  it('should download a missing manifest', async () => {
    const moduleName = `module-${hat()}`
    const data = JSON.stringify({
      _rev: '12345',
      name: moduleName,
      versions: {}
    })

    upstreamModules[`/${moduleName}`] = (request, response) => {
      response.statusCode = 200
      response.end(data)
    }

    const result = await request({
      uri: `${mirrorUrl}/${moduleName}`
    })

    expect(result.trim()).to.equal(data.trim())
  })

  it('should download a missing tarball from an existing module', async () => {
    const moduleName = `module-${hat()}`
    const tarballPath = `${moduleName}/-/${moduleName}-1.0.0.tgz`
    const tarballContent = 'tarball content'
    const manifest = JSON.stringify({
      _rev: '12345',
      name: moduleName,
      versions: {
        '1.0.0': {
          dist: {
            tarball: `${options.mirrorRegistry}/${tarballPath}`,
            shasum: '15d0e36e27c69bc758231f8e9add837f40a40cd0'
          }
        }
      }
    })

    upstreamModules[`/${moduleName}`] = (request, response) => {
      response.statusCode = 200
      response.end(manifest)
    }
    upstreamModules[`/${tarballPath}`] = (request, response) => {
      response.statusCode = 200
      response.end(tarballContent)
    }

    const result = await request({
      uri: `${mirrorUrl}/${tarballPath}`
    })

    expect(result).to.equal(tarballContent)
  })

  it('should download a manifest from a missing scoped module', async () => {
    const moduleName = `@my-scope/module-${hat()}`
    const data = JSON.stringify({
      _rev: '12345',
      name: moduleName,
      versions: {}
    })

    upstreamModules[`/${moduleName}`] = (request, response) => {
      response.statusCode = 200
      response.end(data)
    }

    const result = await request({
      uri: `${mirrorUrl}/${moduleName.replace('/', '%2f')}`
    })

    expect(result.trim()).to.equal(data.trim())
  })

  it('should check with the upstream registry for updated versions', async () => {
    const moduleName = `module-${hat()}`
    const tarball1Path = `${moduleName}/-/${moduleName}-1.0.0.tgz`
    const tarball2Path = `${moduleName}/-/${moduleName}-2.0.0.tgz`
    const tarball1Content = 'tarball 1 content'
    const tarball2Content = 'tarball 2 content'
    const manifest1 = JSON.stringify({
      _rev: '12345-1',
      name: moduleName,
      versions: {
        '1.0.0': {
          dist: {
            shasum: '669965318736dfe855479a6dd441d81f101ae5ae',
            tarball: `${options.mirrorRegistry}/${tarball1Path}`
          }
        }
      }
    })
    const manifest2 = JSON.stringify({
      _rev: '12345-2',
      name: moduleName,
      versions: {
        '1.0.0': {
          dist: {
            shasum: '669965318736dfe855479a6dd441d81f101ae5ae',
            tarball: `${options.mirrorRegistry}/${tarball1Path}`
          }
        },
        '2.0.0': {
          dist: {
            shasum: '4e9dab818d5f0a45e4ded14021cf0bc28c456f74',
            tarball: `${options.mirrorRegistry}/${tarball2Path}`
          }
        }
      }
    })
    let invocations = 0

    upstreamModules[`/${moduleName}`] = (request, response) => {
      response.statusCode = 200
      invocations++

      if (invocations === 1) {
        response.end(manifest1)
      } else {
        response.end(manifest2)
      }
    }
    upstreamModules[`/${tarball1Path}`] = (request, response) => {
      response.statusCode = 200
      response.end(tarball1Content)
    }
    upstreamModules[`/${tarball2Path}`] = (request, response) => {
      response.statusCode = 200
      response.end(tarball2Content)
    }

    const result1 = await request({
      uri: `${mirrorUrl}/${tarball1Path}`
    })
    const result2 = await request({
      uri: `${mirrorUrl}/${tarball2Path}`
    })

    expect(result1).to.equal(tarball1Content)
    expect(result2).to.equal(tarball2Content)
  })

  it('should proxy all other requests to the registry', async () => {
    let data = 'hello world'

    upstreamModules['/-/user/org.couchdb.user:dave'] = data

    const result = await request({
      uri: `${mirrorUrl}/-/user/org.couchdb.user:dave`,
      method: 'put'
    })

    expect(result.trim()).to.equal(data.trim())
  })

  it('should retry when 404s are encountered', async () => {
    const moduleName = `module-404-${hat()}`
    const data = JSON.stringify({
      name: moduleName,
      _rev: '12345',
      versions: {}
    })
    let invocations = 0

    upstreamModules[`/${moduleName}`] = (request, response) => {
      invocations++

      if (invocations === 1) {
        response.statusCode = 404
        return response.end('404')
      }

      response.statusCode = 200
      return response.end(data)
    }

    await request({
      uri: `${mirrorUrl}/${moduleName}`
    })

    expect(invocations).to.equal(2)
  })

  it('should not save tarball CID when shasums do not match', async () => {
    const moduleName = `module-${hat()}`
    const tarballPath = `${moduleName}/-/${moduleName}-1.0.0.tgz`
    const tarballContent = 'tarball content'
    const manifest = JSON.stringify({
      _rev: '12345',
      name: moduleName,
      versions: {
        '1.0.0': {
          dist: {
            tarball: `${options.mirrorRegistry}/${tarballPath}`,
            shasum: 'nope!'
          }
        }
      }
    })

    upstreamModules[`/${moduleName}`] = (request, response) => {
      response.statusCode = 200
      response.end(manifest)
    }
    upstreamModules[`/${tarballPath}`] = (request, response) => {
      response.statusCode = 200
      response.end(tarballContent)
    }

    await request({
      uri: `${mirrorUrl}/${tarballPath}`
    })

    // let the download be processed
    await delay(1000)

    const updated = JSON.parse(await mirror.app.locals.ipfs.files.read(`${baseDir}/${moduleName}`))

    expect(updated.versions['1.0.0'].dist.cid).to.not.be.ok()
  })
})
