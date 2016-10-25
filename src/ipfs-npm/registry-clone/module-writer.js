const async = require('async')
const path = require('path')
const config = require('./../config')
const log = config.log

module.exports = ModuleWriter

function ModuleWriter (bs, v) {
  if (!(this instanceof ModuleWriter)) {
    return new ModuleWriter(bs, v)
  }

  function writeJSONFile (name, data, callback) {
    const stream = bs.createWriteStream(name, callback)
    stream.write(JSON.stringify(data, null, 4) + '\n')
    stream.end()
  }

  const putBall = (info, callback) => {
    info.tarball = path.join(info.path)
    process.nextTick(() => v.verify(info, callback))
  }

  this.saveTarballs = (tarballs, callback) => {
    async.eachLimit(tarballs, config.writeLimit, putBall, callback)
  }

  const putPart = (info, callback) => {
    if (!info.json) {
      return callback()
    }
    writeJSONFile(path.join(info.json.name, info.version, 'index.json'), info.json, callback)
  }

  this.putJSON = (info, callback) => {
    const doc = info.json

    if (!doc.name || doc.error) {
      return callback(doc.error)
    }

    const putAllParts = (err) => {
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

    const seq = info.seq
    const latestSeq = info.latestSeq
    const file = path.join(doc.name, 'index.json')

    log('[' + seq + '/' + latestSeq + ']',
        'writing json for', doc.name, 'to', file)

    writeJSONFile(file, doc, (err) => {
      if (err) {
        return this.putJSON(info, callback)
      }
      if (!info.versions || !info.versions.length) {
        return callback()
      }
      process.nextTick(putAllParts)
    })
  }
}
