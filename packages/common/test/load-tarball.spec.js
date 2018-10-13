/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')

describe('load-tarball', () => {
  let loadTarball
  let loadManifest
  let saveTarball
  let ipfs
  let config

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

    loadManifest = sinon.stub()
    saveTarball = sinon.stub()

    mock('../utils/load-manifest', loadManifest)
    mock('../utils/save-tarball', saveTarball)

    loadTarball = mock.reRequire('../utils/load-tarball')

    ipfs = {
      files: {
        catReadableStream: sinon.stub()
      }
    }
  })

  afterEach(async () => {
    mock.stopAll()
  })

  it('should load a tarball from ipfs', async () => {
    const packageName = `a-module-${hat()}`
    const packageVersion = '1.0.0'
    const path = `/${packageName}/-/${packageName}-${packageVersion}.tgz`
    const pkg = {
      name: packageName,
      versions: {
        [packageVersion]: {
          dist: {
            cid: 'QmZEYeEin6wEB7WNyiT7stYTmbYFGy7BzM7T3hRDzRxTvY'
          }
        }
      }
    }

    loadManifest.withArgs(config, ipfs, packageName)
      .returns(pkg)

    ipfs.files.catReadableStream
      .withArgs(`/ipfs/${pkg.versions[packageVersion].dist.cid}`)
      .resolves('ok')

    const result = await loadTarball(config, ipfs, path)

    expect(result).to.equal('ok')
  })

  it('should download a tarball that has no cid', async () => {
    const packageName = `a-module-${hat()}`
    const packageVersion = '1.0.0'
    const path = `/${packageName}/-/${packageName}-${packageVersion}.tgz`
    const pkg = {
      name: packageName,
      versions: {
        [packageVersion]: {
          dist: {

          }
        }
      }
    }

    loadManifest.withArgs(config, ipfs, packageName)
      .returns(pkg)

    saveTarball.withArgs(config, pkg.name, packageVersion, ipfs)
      .returns('also ok')

    const result = await loadTarball(config, ipfs, path)

    expect(result).to.equal('also ok')
  })
})
