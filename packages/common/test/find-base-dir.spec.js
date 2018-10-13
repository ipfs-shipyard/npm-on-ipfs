/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')
const findBaseDir = require('../utils/find-base-dir')

describe('find-base-dir', () => {
  let containingDirectory
  let dirName
  let prefix
  let config
  let ipfs

  beforeEach(() => {
    containingDirectory = `/${hat()}/${hat()}`
    dirName = hat()
    prefix = `${containingDirectory}/${dirName}`
    config = {
      ipfs: {
        prefix
      }
    }
    ipfs = {
      files: {
        ls: sinon.stub(),
        mkdir: sinon.stub()
      }
    }
  })

  it('should find an existing base dir', async () => {
    const dirHash = 'QmSomethingSomething'
    ipfs.files.ls = sinon.stub().withArgs(containingDirectory, {
      long: true
    }).returns([{
      name: dirName,
      hash: dirHash
    }])

    const result = await findBaseDir(config, ipfs)

    expect(result).to.equal(dirHash)
    expect(ipfs.files.mkdir.called).to.be.false()
  })

  it('should create the base dir if it does not exist', async () => {
    const dirHash = 'QmSomethingSomething'
    ipfs.files.ls = sinon.stub()
      .onFirstCall().returns([])
      .onSecondCall().returns([{
      name: dirName,
      hash: dirHash
    }])

    const result = await findBaseDir(config, ipfs)

    expect(result).to.equal(dirHash)
    expect(ipfs.files.mkdir.called).to.be.true()
    expect(ipfs.files.mkdir.getCall(0).args[0]).to.equal(prefix)
  })
})
