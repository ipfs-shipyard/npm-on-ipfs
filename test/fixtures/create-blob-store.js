'use strict'

const sinon = require('sinon')
const createWriteStream = require('./create-write-stream')

module.exports = () => {
  const blobStore = {
    createWriteStream: sinon.stub(),
    createReadStream: sinon.stub(),
    exists: sinon.stub(),
    remove: sinon.stub()
  }

  blobStore.createWriteStream
    .callsFake((path, callback) => {
      const stream = createWriteStream()

      stream.end.callsFake(() => {
        setImmediate(callback)
      })

      return stream
    })

  return blobStore
}
