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

    const startDownload = Date.now()

    if (error.message.includes('file does not exist')) {
      // try getting the file directly from npm
      downloadFile(options, store, path)
        .then(() => {
          console.info(`✅ Downloaded ${path} in ${Date.now() - startDownload}ms`)

          const downloadStream = store
            .createReadStream(path)

          downloadStream
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

    const downloadStart = Date.now()

    request(url, options.request, (error, _, json) => {
      if (error) {
        return reject(error)
      }

      console.info(`🆒 Downloaded manifest from ${url} in ${Date.now() - downloadStart}ms`)

      if (typeof json === 'string') {
        json = JSON.parse(json)
      }

      console.info(`🔼 Adding manifest from ${url} to IPFS`)
      const addStart = Date.now()

      add(options, {
        json
      }, store)
        .then(() => {
          console.info(`🆗 Added manifest from ${url} to IPFS in ${Date.now() - addStart}ms`)
          resolve()
        })
        .catch((error) => {
          console.info(`💥 Error adding manifest from ${url} - ${error}`)
          reject(error)
        })
    })
  })
}

const downloadTarball = (options, store, path) => {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.com${path}`

    console.info(`🔽 Downloading tarball from ${url}`)
    const downloadStart = Date.now()

    const writeStream = store.createWriteStream(path, (error) => {
      if (error) {
        return reject(error)
      }

      resolve()
    })

    request(url, options.request)
      .on('error', error => {
        console.info(`💥 Error adding tarball from ${url} - ${error}`)
        reject(error)
      })
      .on('end', () => console.info(`🆒 Downloaded tarball from ${url} in ${Date.now() - downloadStart}ms`))
      .once('data', () => {
        console.info(`🔼 Adding tarball from ${url} to IPFS`)
        const addStart = Date.now()

        writeStream.on('end', () => console.info(`🆗 Added tarball from ${url} to IPFS in ${Date.now() - addStart}ms`))
      })
      .pipe(writeStream)
  })
}
