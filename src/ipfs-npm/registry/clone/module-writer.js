'use strict'

const async = require('async')
const path = require('path')

const config = require('../../config')
const log = require('./log')('ModuleWriter')

module.exports = class ModuleWriter {
  constructor (store, verifier) {
    this.store = store
    this.verifier = verifier
  }

  saveTarballs (tarballs, callback) {
    async.eachLimit(
      tarballs,
      config.writeLimit,
      putBall.bind(null, this.verifier),
      callback
    )
  }

  putJSON (info, callback) {
    const doc = info.json

    if (!doc.name || doc.error) {
      return callback(doc.error)
    }

    const putAllParts = () => {
      async.eachLimit(info.versions, 5, (info, cb) => {
        if (!info.json) {
          return cb()
        }

        info.json.name = info.json.name || doc.name
        const partPath = path.join(info.json.name, info.version, 'index.json')
        writeJSONFile(this.store, partPath, info.json, cb)
      }, callback)
    }

    const seq = info.seq
    const latestSeq = info.latestSeq
    const file = path.join(doc.name, 'index.json')

    log('[' + seq + '/' + latestSeq + ']',
        'writing json for', doc.name, 'to', file)

    async.retry(
      {times: 4, interval: 100},
      (cb) => writeJSONFile(this.store, file, doc, cb),
      (err) => {
        if (err) {
          return callback(err)
        }
        if (!info.versions || !info.versions.length) {
          return callback()
        }
        process.nextTick(putAllParts)
      }
    )
  }
}

function writeJSONFile (store, name, data, callback) {
  const stream = store.createWriteStream(name, callback)
  stream.write(JSON.stringify(data, null, 4) + '\n')
  stream.end()
}

function putBall (verifier, info, callback) {
  info.tarball = path.join(info.path)
  process.nextTick(() => verifier.verify(info, callback))
}
