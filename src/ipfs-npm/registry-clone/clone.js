require('dnscache')({ enable: true })
const follow = require('follow-registry')
const patch = require('patch-package-json')
const files = require('./files.js')
const fs = require('graceful-fs')
const timethat = require('timethat').calc
const http = require('http-https')
const url = require('url')
const hooks = require('./hooks')
const options = require('./../config')
const log = require('../config').log
const blobStore = require('./ibs.js')

var latestSeq = 'unknown'
const GLOBAL_INDEX = '-/index.json'
const NOT_FOUND = '-/404.json'

exports.updateIndex = (data, callback) => {
  hooks.globalIndexJson(data, callback, () => {
    return callback()
  })
}

// This pauses the feed until callback is executed
exports.change = (data, callback) => {
  var changeStart = new Date()
  var json
  try {
    json = patch.json(data.json, options.domain)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return callback() // Bad json. Just bail.
    }
    throw err
  }
  if (!json.name) {
    return callback() // Bail, something is wrong with this change
  }
  // Just to make sure that the value is cast to a Number
  data.seq = Number(data.seq)
  latestSeq = Number(latestSeq)
  if (data.seq > latestSeq) {
    latestSeq = data.seq
  }
  data.latestSeq = latestSeq
  console.log('[' + data.seq + '/' + latestSeq + '] processing', json.name)
  if (!data.versions.length) {
    return callback()
  }
  data.versions.forEach((item) => {
    item.json = patch.json(item.json, options.domain)
  })
  hooks.beforeAll(data, callback, () => {
    files.saveTarballs(data.tarballs, () => {
      files.saveJSON(data, (err) => {
        if (err) {
          log.err(err)
          return callback()
        }
        var num = Object.keys(json.versions).length
        /* istanbul ignore next just a log line with logic */
        console.log('[' + data.seq + '/' + latestSeq + '] finished', num, 'version' + ((num > 1) ? 's' : '') + ' of', json.name, 'in', timethat(changeStart))
        hooks.afterAll(data, callback, callback)
      })
    })
  })
}

exports.defaults = (opts, callback) => {
  if (!callback && typeof opts === 'function') { // for testing
    callback = opts
    opts = options
  }
  var error = blobStore.createWriteStream(NOT_FOUND, (err) => {
    if (err) {
      return log.err(err)
    }
    blobStore.exists(GLOBAL_INDEX, (err, good) => {
      if (err) {
        return callback(err)
      }
      if (good) {
        log('skipping index.json since it exists')
        return callback(err)
      }
      var index = blobStore.createWriteStream(GLOBAL_INDEX, callback)
      log('Writing index.json')
      fs.createReadStream(opts.index).on('error', callback).pipe(index)
    })
  })
  log('Writing 404.json')
  fs.createReadStream(opts.error).on('error', callback).pipe(error)
}

exports.clean = (callback) => {
  if (!options.clean) {
    return callback()
  }
  var start = new Date()
  log('Deleting', options.seqFile)
  fs.unlink(options.seqFile, () => {
    console.log('finished cleaning in', timethat(start))
    callback()
  })
}

function updateLatestSeq () {
  var timer = function () {
    var u = url.parse('https://skimdb.npmjs.com/registry')
    u.headers = {
      'user-agent': 'registry-mirror mirror worker'
    }
    http.get(u, (res) => {
      var d = ''
      res.on('data', (data) => {
        d += data
      })
      res.on('end', function () {
        var json = JSON.parse(d)
        latestSeq = json.update_seq
        log('new latest sequence', latestSeq)
      })
    })
  }
  setInterval(timer, ((60 * 5) * 1000))
  timer()
}

exports.run = () => {
  updateLatestSeq()
  var conf = {
    seqFile: options.seqFile,
    handler: exports.change
  }
  log('starting to follow registry with these options:')
  log('   domain', options.domain)
  log('   directory', options.dir)
  log('   tmp', options.tmp)
  follow(conf)
}

exports.start = () => {
  exports.clean(() => {
    exports.defaults(exports.run)
  })
}
