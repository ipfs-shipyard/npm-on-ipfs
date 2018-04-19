'use strict'

const cluster = require('cluster')
const os = require('os')
const EventEmitter = require('events').EventEmitter
const assert = require('assert')

const log = require('./log')('Workers')

module.exports = class Workers extends EventEmitter {
  constructor (exec, num) {
    super()

    assert(exec, 'missing worker file')

    this.exec = exec
    this.NUM_WORKERS = num || os.cpus().length || 4
    this.currentWorker = 0

    cluster.setupMaster({
      exec: this.exec
    })

    cluster.on('exit', this._exitHandler.bind(this))
    cluster.on('fork', this._forkHandler.bind(this))

    for (let i = 0; i < this.NUM_WORKERS; i++) {
      cluster.fork()
    }

    this.eachWorker((worker) => {
      worker.on('message', this._messageHandler.bind(this, worker.id))
    })
  }

  kill () {
    this.eachWorker((worker) => worker.kill())
  }

  eachWorker (task) {
    Object.keys(cluster.workers).forEach((id) => {
      task(cluster.workers[id])
    })
  }

  sendAll (cmd, data) {
    this.eachWorker((worker) => {
      worker.send({
        cmd: cmd,
        data: data
      })
    })
  }

  // New job to be run on the next worker
  sendNext (cmd, data) {
    this._getNextWorker().send({
      cmd: cmd,
      data: data
    })
  }

  // Round Robin worker fetching
  _getNextWorker () {
    log('worker %s/%s', this.currentWorker, this.NUM_WORKERS)
    const id = Object.keys(cluster.workers)[this.currentWorker]
    this.currentWorker = (this.currentWorker + 1) % this.NUM_WORKERS
    return cluster.workers[id]
  }

  _messageHandler (id, msg) {
    this.emit(msg.cmd, msg.data, id)
  }

  _forkHandler () {
    log('fork')
  }

  _exitHandler (worker, code, signal) {
    if (worker.exitedAfterDisconnect) {
      return
    }

    log('worker %d died (%s). restarting...',
      worker.process.pid, signal || code)
    cluster.fork()
  }
}
