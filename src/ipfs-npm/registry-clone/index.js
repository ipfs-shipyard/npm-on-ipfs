'use strict'

const config = require('../config')
const log = config.log
require('dnscache')({ enable: true })
const follow = require('follow-registry')
const patch = require('patch-package-json')
const fs = require('graceful-fs')
const timethat = require('timethat').calc
const Wreck = require('wreck')
const IBS = require('ipfs-blob-store')
const multiaddr = require('multiaddr')
const series = require('async/series')
const ModuleWriter = require('./module-writer')
const Verifier = require('./verifier')

var latestSeq = 'unknown'
// const GLOBAL_INDEX = '-/index.json'
// const NOT_FOUND = '-/404.json'

module.exports = RegistryClone

function RegistryClone (ipfs, seqNumber) {
  if (!(this instanceof RegistryClone)) {
    return new RegistryClone(ipfs, seqNumber)
  }

  let bsConfig = config.blobStore

  if (ipfs) {
    bsConfig = Object.assign(bsConfig, multiaddr(ipfs).nodeAddress())
  }

  if (seqNumber) {
    // TODO: what to do?
  }

  const bs = IBS(bsConfig)
  const v = new Verifier(bs)
  const mw = new ModuleWriter(bs, v)

  // This pauses the feed until callback is executed
  function change (data, callback) {
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

    series([
      (cb) => mw.saveTarballs(data.tarballs, cb),
      (cb) => mw.putJSON(data, cb)
    ], (err, res) => {
      if (err) {
        log.err(err)
        return callback()
      }
      var num = Object.keys(json.versions).length
      /* istanbul ignore next just a log line with logic */
      console.log('change: [' + data.seq + '/' + latestSeq + '] finished', num, 'version' + ((num > 1) ? 's' : '') + ' of', json.name, 'in', timethat(changeStart))
      callback()
    })
  }

  function clean (callback) {
    if (!config.clean) {
      return callback()
    }

    const start = new Date()

    log('Deleting', config.seqFile)

    fs.unlink(config.seqFile, () => {
      console.log('finished cleaning in', timethat(start))
      callback()
    })
  }

  function updateLatestSeq () {
    const timer = function () {
      const opts = {
        headers: {
          'user-agent': 'ipfs-npm mirror worker'
        }
      }

      Wreck.get(config.skim, opts, (err, res, payload) => {
        if (err) {
          return log(err)
        }

        latestSeq = payload.update_seq
        log('new latest sequence', latestSeq)
      })
    }

    setInterval(timer, ((60 * 5) * 1000))
    timer()
  }

  function run () {
    updateLatestSeq()
    const conf = {
      seqFile: config.seqFile,
      handler: change
    }

    log('starting to follow registry with these options:')
    log('   seqFile', conf.seqFile)
    follow(conf)
  }

  clean(run)
}
