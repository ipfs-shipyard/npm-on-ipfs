'use strict'

require('dnscache')({ enable: true })
const follow = require('follow-registry')
const fs = require('graceful-fs')
const timethat = require('timethat').calc
const request = require('request')
const multiaddr = require('multiaddr')
const async = require('async')
const path = require('path')

const Workers = require('./workers')
const config = require('../../config')
const log = require('./log')('clone')

let latestSeq = 'unknown'
// const GLOBAL_INDEX = '-/index.json'
// const NOT_FOUND = '-/404.json'

module.exports = function registryClone (ipfs, opts) {
  opts = Object.assign({
    store: 'ipfs-blob-store',
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

  updateLatestSeq()

  if (config.clean) {
    async.series([
      (cb) => clean(config.seqFile, cb),
      run
    ])
  } else {
    run()
  }

  // setup workers
  const workers = new Workers(
    path.join(__dirname, 'worker.js')
  )
  workers.on('processed', processedHandler)
  workers.sendAll('init', {
    store: storeConfig,
    storeName: opts.store
  })

  const callbacks = new Map()

  // This pauses the feed until callback is executed
  function changeHandler (data, callback) {
    // Just to make sure that the value is cast to a Number
    data.seq = Number(data.seq)
    latestSeq = Number(latestSeq)
    if (data.seq > latestSeq) {
      latestSeq = data.seq
    }
    data.latestSeq = latestSeq

    log('change %s/%s', data.seq, latestSeq)

    callbacks.set(data.seq, callback)

    if (data.seq % opts.flushInterval === 0) {
      flushToDisk(() => {
        workers.sendNext('change', data)
      })
    } else {
      workers.sendNext('change', data)
    }
  }

  function processedHandler (seq) {
    log('processed', seq)
    callbacks.get(seq)()
    callbacks.delete(seq)
  }

  function run () {
    log('starting to follow registry')
    follow(followConf)
  }

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
          return log.error(
            'latestSeq: %s',
            err.message || `Response: %{res.statusCode}`
          )
        }
        try {
          latestSeq = JSON.parse(payload).update_seq
          log('latestSeq: updated to %s', latestSeq)
        } catch (err) {
          log('latestSeq: failed to update')
        }
      })
    }

    setInterval(timer, ((60 * 5) * 1000))
    timer()
  }

  function flushToDisk (callback) {
    log('flush:start:%s', storeConfig.baseDir)
    ipfs.files.stat(storeConfig.baseDir, (err, stat) => {
      if (err) {
        log.error('flush: %s', err.message)
        return callback()
      }

      log('flush:stop:%s', storeConfig.baseDir, JSON.stringify(stat))
      writeStats(stat)

      callback()
    })
  }

  function writeStats (stat) {
    stat.date = Date.now()
    fs.appendFileSync('flushlog.txt', JSON.stringify(stat) + '\n\n')
  }
}

function clean (file, callback) {
  const start = new Date()

  log('clean:start', file)

  fs.unlink(file, () => {
    log('clean:stop [%s]', timethat(start))
    callback()
  })
}
