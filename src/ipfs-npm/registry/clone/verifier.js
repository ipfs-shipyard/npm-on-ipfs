'use strict'

const request = require('request')
const timethat = require('timethat').calc
const url = require('url')
const pretty = require('prettysize')
const sha = require('sha')
const once = require('once')

const config = require('../../config')

const log = require('./log')('Verifier')

module.exports = class Verifier {
  constructor (bs) {
    this.store = bs
    this.counter = {}
    this.report = {}
  }

  // This is the function where the tarball gets downloaded and stored
  update (info, callback) {
    callback = once(callback)
    if (!info.path || !info.tarball || !info.shasum) {
      return callback(new Error('insufficient data'))
    }

    log('updating [%s]', this.counter[info.path], info.path, info.tarball, info.shasum)

    const errorHandler = (msg, writer) => (err) => {
      this.report.error = err
      this.report[info.tarball] = info

      delete this.counter[info.path]

      // in case end has already been called by the error handler
      // sometimes it happens :(
      try {
        writer.end()
      } catch (err) {}

      callback(new Error(msg + ' ' + info.tarball))
    }

    process.nextTick(() => {
      const writer = this.store.createWriteStream(info.tarball, (err) => {
        if (err) {
          return errorHandler('failed to save to ipfs', writer)(err)
        }
        // already called back
        if (this.counter[info.path] === undefined) {
          return
        }
        log('[' + this.counter[info.path] + '] finished downloading', u, 'in', timethat(startDL))
        process.nextTick(() => this.verify(info, callback))
      })

      this.counter[info.path] = this.counter[info.path] || 0
      this.counter[info.path]++

      const startDL = new Date()
      const u = url.format({
        protocol: config.protocol,
        hostname: config.registry,
        pathname: info.path.substring(1)
      })

      const opts = {
        url: u,
        headers: {
          'user-agent': 'ipfs-npm mirror worker'
        }
      }

      log('[' + this.counter[info.path] + '] downloading', u)
      request(opts)
        .on('error', errorHandler('failed to download', writer))
        .on('response', (res) => {
          log('[' + this.counter[info.path] + ']', '(' + res.statusCode + ')', info.path, 'is', pretty(res.headers['content-length']))

          info.http = res.statusCode

          if (res.statusCode === 404) {
            this.report[info.tarball] = info
            delete this.counter[info.path]
            writer.end()
            return callback(new Error('failed to download with a 404: ' + info.tarball))
          }
        })
        .pipe(sha.stream(info.shasum))
        .on('error', errorHandler('failed to verify shasum', writer))
        .pipe(writer)
        .on('error', errorHandler('failed to write', writer))
    })
  }

  verify (info, callback) {
    this.counter[info.path] = this.counter[info.path] || 0

    this.store.exists(info.tarball, (err, exists) => {
      if (err) {
        log.error(err)
      }

      if (!exists) {
        return this.update(info, callback)
      }

      if (this.counter[info.path] >= 4) {
        this.report[info.tarball] = info
        log(' [' + this.counter[info.path] + '] file appears to be corrupt, skipping..', info.tarball)
      }

      delete this.counter[info.path]
      callback(null, info)
    })
  }
}
