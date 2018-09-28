'use strict'

const {
  PassThrough
} = require('stream')
const readOrDownloadTarball = require('./read-or-download-tarball')
const loadManifest = require('../utils/load-manifest')

module.exports = (options, ipfs, app) => {
  return {
    createReadStream: (path) => {
      const output = new PassThrough()

      path = `${(path || '').trim()}`.replace(/^(\/)+/, '/')

      if (path.startsWith('/')) {
        path = path.substring(1)
      }

      if (path.startsWith('@')) {
        path = path.replace(/%2f/g, '/')
      }

      if (path.endsWith('tgz')) {
        readOrDownloadTarball(options, ipfs, path, app)
          .then(stream => {
            stream
              .on('error', (error) => {
                output.emit('error', error)
                output.end()
              })
              .pipe(output)
          })
          .catch(error => {
            output.emit('error', error)
            output.end()
          })
      } else {
        loadManifest(options, ipfs, path, app)
          .then(manifest => {
            output.end(JSON.stringify(manifest))
          })
          .catch(error => {
            output.emit('error', error)
            output.end()
          })
      }

      return output
    }
  }
}
