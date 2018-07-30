'use strict'

const async = require('async')
const path = require('path')
const log = require('debug')('ipfs:registry-mirror:files')

function writeJSONFile (name, data, blobStore) {
  return new Promise((resolve, reject) => {
    log(`Writing ${name}`)
    const stream = blobStore.createWriteStream(name, (error, meta) => {
      if (error) {
        return reject(error)
      }

      resolve(meta)
    })
    stream.write(JSON.stringify(data) + '\n')
    stream.end()
  })
}

const saveJSON = (info, blobStore) => {
  const doc = info.json

  if (!doc.name || doc.error) {
    const error = doc.error || new Error('No name found in package.json')

    throw error
  }

  const file = path.join(doc.name, 'index.json')

  log(`Writing json for ${doc.name} to ${file}`)

  return writeJSONFile(file, doc, blobStore)
    .then(() => {
      const versions = info.versions || []

      return Promise.all(
        versions.map(({version, json}) => {
          if (!version || !json) {
            return
          }

          const name = json.name || doc.name
          const file = path.join(name, version, 'index.json')

          log(`Writing json for ${name}@${version} to ${file}`)

          return writeJSONFile(file, json, blobStore)
        })
      )
    })
}

module.exports = {
  saveJSON
}
