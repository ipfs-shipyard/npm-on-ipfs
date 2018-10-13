/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')

const pkg = (name) => {
  return {
    name: name,
    _rev: hat()
  }
}

describe('load-manifest', () => {
  let loadManifest
  let saveManifest
  let request
  let ipfs
  let config

  let existentPackage = pkg(`i-exist-${hat()}`)
  let nonExistentPackage = pkg(`i-do-not-exist-${hat()}`)
  let newPackage = pkg(`i-am-new-${hat()}`)
  let updatedPackage = pkg(`i-have-new-${hat()}`)
  let newVersionOfUpdatedPackage = pkg(updatedPackage.name)

  beforeEach(async () => {
    config = {
      registryUpdateInterval: 0,
      registry: `http://foo`,
      ipfs: {
        prefix: `/registry-prefix-${hat()}`
      },
      request: {

      },
      http: {
        host: 'localhost',
        port: 8080,
        protocol: 'http'
      }
    }

    request = sinon.stub()

    saveManifest = sinon.stub()
    mock('../utils/retry-request', request)
    mock('../utils/save-manifest', saveManifest)
    loadManifest = mock.reRequire('../utils/load-manifest')

    ipfs = {
      files: {
        read: sinon.stub()
      }
    }
  })

  afterEach(async () => {
    mock.stopAll()
  })

  it('should load a manifest from ipfs', async () => {
    ipfs.files.read.withArgs(`${config.ipfs.prefix}/${existentPackage.name}`)
      .resolves(JSON.stringify(existentPackage))

    request
      .withArgs({
        uri: `${config.registry}/${existentPackage.name}`,
        json: true
      })
      .resolves(existentPackage)

    const result = await loadManifest(config, ipfs, existentPackage.name)

    expect(result).to.deep.equal(existentPackage)
    expect(saveManifest.called).to.be.false()
    expect(request.called).to.be.true()
  })

  it('should load a manifest from npm when not found in mfs', async () => {
    ipfs.files.read.withArgs(`${config.ipfs.prefix}/${newPackage.name}`)
      .rejects(new Error('file does not exist'))

    request
      .withArgs({
        uri: `${config.registry}/${newPackage.name}`,
        json: true
      })
      .resolves(newPackage)

    const result = await loadManifest(config, ipfs, newPackage.name)

    expect(result).to.deep.equal(newPackage)
    expect(saveManifest.called).to.be.true()
    expect(request.called).to.be.true()
  })

  it('should favour an updated manifest from npm', async () => {
    updatedPackage.versions = {
      '0.0.1': {
        dist: {
          cid: 'a-cid',
          tarball: 'a-tarball',
          source: 'original-tarball'
        }
      }
    }

    newVersionOfUpdatedPackage.versions = {
      '0.0.1': {
        dist: {
          tarball: 'original-tarball'
        }
      },
      '0.0.2': {
        dist: {
          tarball: 'new-tarball'
        }
      }
    }

    ipfs.files.read.withArgs(`${config.ipfs.prefix}/${updatedPackage.name}`)
      .resolves(JSON.stringify(updatedPackage))

    request
      .withArgs({
        uri: `${config.registry}/${updatedPackage.name}`,
        json: true
      })
      .resolves(JSON.parse(JSON.stringify(newVersionOfUpdatedPackage)))

    const result = await loadManifest(config, ipfs, updatedPackage.name)

    expect(result.versions['0.0.1'].dist.cid).to.equal(updatedPackage.versions['0.0.1'].dist.cid)
    expect(result.versions['0.0.2'].dist.source).to.equal(newVersionOfUpdatedPackage.versions['0.0.2'].dist.tarball)

    expect(saveManifest.called).to.be.true()
    expect(request.called).to.be.true()
  })

  it('should explode when a module does not exist', async () => {
    ipfs.files.read.withArgs(`${config.ipfs.prefix}/${nonExistentPackage.name}`)
      .rejects(new Error('file does not exist'))

    request
      .withArgs({
        uri: `${config.registry}/${nonExistentPackage.name}`,
        json: true
      })
      .rejects(new Error('404'))

    try {
      await loadManifest(config, ipfs, nonExistentPackage.name)
      throw new Error('Expected loadManifest to throw')
    } catch (error) {
      expect(error.message).to.include('Not found')
    }
  })
})
