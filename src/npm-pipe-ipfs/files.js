'use strict'

const async = require('async')
const path = require('path')
const config = require('../config')
const verify = require('./verify')
const hooks = require('./hooks')
const log = config.log
const blobStore = require('./ibs')

function writeJSONFile (name, data, callback) {
  process.nextTick(() => {
    var stream = blobStore.createWriteStream(name, callback)
    stream.write(JSON.stringify(data, null, 4) + '\n')
    stream.end()
  })
}

var putBall = (info, callback) => {
  info.tarball = path.join(info.path)

  hooks.tarball(info, callback, () => {
    process.nextTick(() => {
      verify.verify(info, (err) => {
        if (err) {
          return callback(err)
        }

        hooks.afterTarball(info, callback, callback)
      })
    })
  })
}

var saveTarballs = (tarballs, callback) => {
  process.nextTick(() => {
    async.eachLimit(tarballs, config.limit, putBall, callback)
  })
}

exports.saveTarballs = saveTarballs

var putPart = (info, callback) => {
  if (!info.json) {
    return callback()
  }
  hooks.versionJson(info, callback, () => {
    writeJSONFile(path.join(info.json.name, info.version, 'index.json'), info.json, callback)
  })
}

var putJSON = (info, callback) => {
  var doc = info.json

  if (!doc.name || doc.error) {
    return callback(doc.error)
  }

  var putAllParts = (err) => {
    if (err) {
      return callback(err)
    }

    info.versions.forEach((item, key) => {
      if (item.json) {
        item.json.name = item.json.name || doc.name
        info.versions[key] = item
      }
    })

    async.eachLimit(info.versions, 5, putPart, callback)
  }
  var seq = info.seq
  var latestSeq = info.latestSeq
  hooks.indexJson(info, putAllParts, function () {
    var file = path.join(doc.name, 'index.json')
    log('[' + seq + '/' + latestSeq + ']', 'writing json for', doc.name, 'to', file)

    writeJSONFile(file, doc, (err) => {
      if (err) {
        return callback(err)
      }

      if (!info.versions || !info.versions.length) {
        return callback()
      }

      process.nextTick(putAllParts)
    })
  })
}

exports.saveJSON = putJSON
