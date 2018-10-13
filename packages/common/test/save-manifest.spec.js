/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')
const saveManifest = require('../utils/save-manifest')

describe('save-manifest', () => {
  let ipfs
  let config

  beforeEach(async () => {
    config = {
      ipfs: {
        prefix: `/registry-prefix-${hat()}`,
        flush: true
      }
    }

    ipfs = {
      files: {
        write: sinon.stub()
      }
    }
  })

  it('should save a manifest to ipfs', async () => {
    const pkg = {
      name: `module-${hat()}`
    }

    ipfs.files.write.withArgs(`${config.ipfs.prefix}/${pkg.name}`)
      .resolves()

    await saveManifest(pkg, ipfs, config)

    expect(ipfs.files.write.called).to.be.true()
  })

  it('should require a package name', async () => {
    const pkg = {

    }

    try {
      await saveManifest(pkg, ipfs, config)
      throw new Error('Expected saveManifest to throw')
    } catch (error) {
      expect(error.message).to.contain('No name found')
      expect(ipfs.files.write.called).to.be.false()
    }
  })
})
