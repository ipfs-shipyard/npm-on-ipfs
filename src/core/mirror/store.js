'use strict'

const ipfsBlobStore = require('ipfs-blob-store')
const {
  PassThrough
} = require('stream')
const add = require('../clone/add')
const request = require('request')

module.exports = (options) => {
  const store = ipfsBlobStore(options.ipfs)

  return {
    createReadStream: (path) => {
      const output = new PassThrough()

      const stream = store.createReadStream(path)
      stream.once('error', readError(options, store, path, output, stream))
      stream.pipe(output)

      return output
    }
  }
}

const readError = (options, store, path, output, stream) => {
  return (error) => {
    stream.unpipe(output)

    if (error.message.includes('file does not exist')) {
      // try getting the file directly from npm
      downloadFile(options, store, path)
        .then(() => {
          console.info(`✅ Downloaded ${path}`)

          const downloadStream = store
            .createReadStream(path)

          downloadStream
            //.once('error', readError(path, output, downloadStream))
            .once('error', () => {
              console.error(`💥 Error downloading after retrying ${path} - ${error}`)
              output.emit('error', error)
            })
            .pipe(output)
        })
        .catch(error => {
          console.error(`💥 Error downloading ${path} - ${error}`)
          output.emit('error', error)
        })
    } else {
      output.emit('error', error)
    }
  }
}

const downloadFile = (options, store, path) => {
  if (path.endsWith('/index.json')) {
    return downloadManifest(options, store, path)
  }

  return downloadTarball(options, store, path)
}

const downloadManifest = (options, store, path) => {
  return new Promise((resolve, reject) => {
    path = path.replace('/index.json', '')

    const url = `${options.mirror.registry}${path}`

    console.info(`🔽 Downloading manifest from ${url}`)

    request(url, options.request, (error, _, json) => {
      if (error) {
        return reject(error)
      }

      if (typeof json === 'string') {
        json = JSON.parse(json)
      }

      add(options, {
        json
      }, store)
        .then(() => {
          resolve()
        })
        .catch((error) => {
          console.info(`🔽 Error adding manifest ${url} - ${error}`)
          reject(error)
        })
    })
  })
}

const downloadTarball = (options, store, path) => {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.com${path}`

    console.info(`🔽 Downloading tarball from ${url}`)

    const writeStream = store.createWriteStream(path, (error) => {
      if (error) {
        return reject(error)
      }

      resolve()
    })

    request(url, options.request)
      .on('error', error => reject(error))
      .pipe(writeStream)
  })
}
