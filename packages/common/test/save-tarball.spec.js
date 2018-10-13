/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')
const {
  PassThrough
} = require('stream')

describe('save-tarball', () => {
  let saveTarball
  let loadManifest
  let saveManifest
  let request
  let ipfs
  let config

  beforeEach(async () => {
    config = {
      request: {

      }
    }

    request = sinon.stub()
    loadManifest = sinon.stub()
    saveManifest = sinon.stub()

    mock('../utils/retry-request', request)
    mock('../utils/save-manifest', saveManifest)
    mock('../utils/load-manifest', loadManifest)

    saveTarball = mock.reRequire('../utils/save-tarball')

    ipfs = {
      files: {
        add: sinon.stub()
      }
    }
  })

  afterEach(async () => {
    mock.stopAll()
  })

  it('should not save a tarball we have already downloaded', (done) => {
    const versionNumber = '1.0.0'
    const pkg = {
      name: `module-${hat()}`,
      versions: {
        [versionNumber]: {
          dist: {
            cid: 'a-cid',
            source: 'tarball-url',
            shasum: 'tarball-shasum'
          }
        }
      }
    }

    loadManifest.withArgs(config, ipfs, pkg.name)
      .resolves(pkg)

    saveTarball(config, pkg.name, versionNumber, ipfs, () => {
      expect(request.called).to.be.false()

      done()
    })
  })

  it('should download a missing tarball', (done) => {
    const versionNumber = '1.0.0'
    const pkg = {
      name: `module-${hat()}`,
      versions: {
        [versionNumber]: {
          dist: {
            source: 'tarball-url',
            shasum: '3c4fb10163dc33fd83b588fe36af9aa5efba2985'
          }
        }
      }
    }

    loadManifest.withArgs(config, ipfs, pkg.name)
      .resolves(pkg)

    ipfs.files.add.callsFake(stream => {
      return new Promise((resolve) => {
        stream.on('end', () => {
          resolve([{
            hash: 'QmZEYeEin6wEB7WNyiT7stYTmbYFGy7BzM7T3hRDzRxTvY'
          }])
        })
      })
    })

    request.withArgs({
      uri: 'tarball-url'
    })
      .callsFake(() => {
        const stream = new PassThrough()

        setTimeout(() => {
          stream.write('tarball-content')
          stream.end()
        }, 100)

        return Promise.resolve(stream)
      })

    saveTarball(config, pkg.name, versionNumber, ipfs, () => {
      expect(request.called).to.be.true()

      done()
    })
  })
})
