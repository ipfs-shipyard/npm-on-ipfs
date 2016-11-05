'use strict'

const patch = require('patch-package-json')
const async = require('async')
const timethat = require('timethat').calc

const Verifier = require('./verifier')
const ModuleWriter = require('./module-writer')
const config = require('../../config')
const log = require('./log')('Worker')

let mw

process.on('message', handleMessage)

function handleMessage (msg) {
  switch (msg.cmd) {
    case 'init':
      handleInit(msg.data)
      break
    case 'change':
      handleChange(msg.data)
      break
    default:
      log.error('Unkown message: %s', msg.cmd)
  }
}

function handleInit (opts) {
  log('init')

  const storeConfig = opts.store

  const bs = require(opts.storeName)(storeConfig)
  const v = new Verifier(bs)
  mw = new ModuleWriter(bs, v)
}

function handleChange (data) {
  const callback = () => {
    process.send({
      cmd: 'processed',
      data: data.seq
    })
  }

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

  log('change: [' + data.seq + '] processing', json.name)
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
      console.error(err)
      return callback()
    }

    const num = Object.keys(json.versions).length
    /* istanbul ignore next just a log line with logic */
    log('change: [' + data.seq + ' ] finished', num, 'version' + ((num > 1) ? 's' : '') + ' of', json.name, 'in', timethat(changeStart))

    callback()
  })
}
