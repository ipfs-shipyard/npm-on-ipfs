'use strict'

const http = require('http-https')
const config = require('./../config')
const timethat = require('timethat').calc
const url = require('url')
const uparse = url.parse
const pretty = require('prettysize')
const log = config.log

module.exports = Verifier

function Verifier (bs) {
  if (!(this instanceof Verifier)) {
    return new Verifier(bs)
  }

  const counter = {}
  const report = {}

  this.report = () => { return report }
  this.counter = () => { return counter }

  // This is the function where the tarball gets downloaded and stored
  this.update = (info, callback) => {
    const url = config.registry + info.path.substring(1)
    let callbackDone = false

    process.nextTick(() => {
      const writer = bs.createWriteStream(info.tarball)
      counter[info.path] = counter[info.path] || 0
      counter[info.path]++
      log('[' + counter[info.path] + '] downloading', url)
      const startDL = new Date()
      const u = uparse(url)

      u.headers = {
        'user-agent': 'ipfs-npm mirror worker'
      }

      const req = http.get(u)

      req.on('error', (e) => {
        callbackDone = true
        req.end()
        log(' [' + counter[info.path] + '] failed to download', info.tarball)
        report.error = e
        report[info.tarball] = info
        delete counter[info.path]
        // in case end has already been called by the error handler
        // sometimes it happens :(
        try {
          writer.end()
        } catch (err) {}
        return callback(new Error('failed to download ' + info.tarball))
      })

      req.on('response', (res) => {
        log('[' + counter[info.path] + ']', '(' + res.statusCode + ')', info.path, 'is', pretty(res.headers['content-length']))

        info.http = res.statusCode

        if (res.statusCode === 404) {
          log(' [' + counter[info.path] + '] failed to download with a 404', info.tarball)

          callbackDone = true
          report[info.tarball] = info
          delete counter[info.path]
          writer.end()
          req.abort()
          return callback(new Error('failed to download ' + info.tarball))
        }

        res.on('end', () => {
          if (callbackDone) {
            return
          }
          log('[' + counter[info.path] + '] finished downloading', url, 'in', timethat(startDL))
          process.nextTick(() => {
            this.verify(info, callback)
          })
        })

        res.pipe(writer)
      })
    })
  }

  this.verify = (info, callback) => {
    counter[info.path] = counter[info.path] || 0

    bs.exists(info.tarball, (err, good) => {
      if (err) {
        return log.err(err)
      }

      if (!good) {
        return this.update(info, callback)
      }

      if (counter[info.path] >= 4) {
        report[info.tarball] = info
        log(' [' + counter[info.path] + '] file appears to be corrupt, skipping..', info.tarball)
        delete counter[info.path]
        // bail, the tarball is corrupt
        return callback(null, info)
      }

      shasumCheck(info, (err) => {
        if (err) {
          this.update(info, callback)
        }
        delete counter[info.path]
        callback(null, info)
      })
    })
  }

  // TODO shasum check was never in place, needs to be implemented
  function shasumCheck (info, callback) {
    callback()
  }
}
