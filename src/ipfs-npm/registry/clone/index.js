'use strict'

require('dnscache')({ enable: true })
const follow = require('follow-registry')
const patch = require('patch-package-json')
const fs = require('graceful-fs')
const timethat = require('timethat').calc
const request = require('request')
const multiaddr = require('multiaddr')
const async = require('async')

const ModuleWriter = require('./module-writer')
const Verifier = require('./verifier')
const config = require('../../config')
const log = config.log

let latestSeq = 'unknown'
// const GLOBAL_INDEX = '-/index.json'
// const NOT_FOUND = '-/404.json'

module.exports = function registryClone (ipfs, opts) {
  opts = Object.assign({
    store: require('ipfs-blob-store'),
    flushInterval: 10000
  }, opts)

  let storeConfig = config.blobStore

  if (opts.url) {
    const parsed = multiaddr(opts.url).nodeAddress()
    storeConfig = Object.assign(storeConfig, {
      host: parsed.address,
      port: parseInt(parsed.port, 10)
    })
  }

  if (typeof opts.flush === 'boolean') {
    storeConfig.flush = opts.flush
  }

  const followConf = {
    seqFile: config.seqFile,
    handler: changeHandler,
    registry: config.registry,
    skim: config.skim
  }

  if (opts.seqNumber) {
    followConf.since = opts.seqNumber
  }

  log('starting ipfs blob store with', storeConfig)

  const bs = opts.store(storeConfig)
  const v = new Verifier(bs)
  const mw = new ModuleWriter(bs, v)

  updateLatestSeq()

  if (config.clean) {
    async.series([
      (cb) => clean(config.seqFile, cb),
      run
    ])
  } else {
    run()
  }

  function run () {
    log('starting to follow registry with these options:')
    log('   seqFile', followConf.seqFile)
    follow(followConf)
  }

  let flushCounter = 0

  function updateLatestSeq () {
    const timer = function () {
      const opts = {
        url: config.skim,
        headers: {
          'user-agent': 'ipfs-npm mirror worker'
        }
      }

      request(opts, (err, res, payload) => {
        if (err || res.statusCode > 400) {
          return log.err(err || `Response: %{res.statusCode}`)
        }
        try {
          latestSeq = JSON.parse(payload).update_seq
          log('new latest sequence', latestSeq)
        } catch (err) {
          log('failed to update to latest sequence')
        }
      })
    }

    setInterval(timer, ((60 * 5) * 1000))
    timer()
  }

  // This pauses the feed until callback is executed
  function changeHandler (data, callback) {
    flushCounter++
    log('flushCounter: %s', flushCounter)
    if (opts.flush === false && flushCounter >= opts.flushInterval) {
      flushToDisk(() => {
        flushCounter = 0
        handleChange(data, callback)
      })
    } else {
      handleChange(data, callback)
    }
  }

  function flushToDisk (callback) {
    log('start: flushing %s', storeConfig.baseDir)

    ipfs.files.stat(storeConfig.baseDir, (err, stat) => {
      if (err) {
        log.error('failed to flush: %s', err.message)
        return callback()
      }

      log('finish: flushing %s', storeConfig.baseDir, JSON.stringify(stat))

      callback()
    })
  }

  function handleChange (data, callback) {
    const changeStart = new Date()
    let json
    try {
      json = patch.json(data.json, config.domain)
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
    console.log('change: [' + data.seq + '/' + latestSeq + '] processing', json.name)
    if (!data.versions.length) {
      return callback()
    }
    data.versions.forEach((item) => {
      item.json = patch.json(item.json, config.domain)
    })

    async.series([
      (cb) => mw.saveTarballs(data.tarballs, cb),
      (cb) => mw.putJSON(data, cb)
    ], (err, res) => {
      if (err) {
        log.err(err)
        return callback()
      }
      const num = Object.keys(json.versions).length
      /* istanbul ignore next just a log line with logic */
      console.log('change: [' + data.seq + '/' + latestSeq + '] finished', num, 'version' + ((num > 1) ? 's' : '') + ' of', json.name, 'in', timethat(changeStart))
      callback()
    })
  }
}

function clean (file, callback) {
  const start = new Date()

  log('Deleting', file)

  fs.unlink(file, () => {
    console.log('finished cleaning in', timethat(start))
    callback()
  })
}
