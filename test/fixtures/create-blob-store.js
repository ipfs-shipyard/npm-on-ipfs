'use strict'

const sinon = require('sinon')
const MemoryBlobStore = require('memory-blob-store')

module.exports = () => {
  const blobStore = new MemoryBlobStore()

  sinon.spy(blobStore, 'createWriteStream')
  sinon.spy(blobStore, 'exists')
  sinon.spy(blobStore, 'createReadStream')
  sinon.spy(blobStore, 'remove')

  return blobStore
}
