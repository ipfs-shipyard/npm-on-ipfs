'use strict'

const debug = require('debug')
const cluster = require('cluster')

module.exports = (name) => {
  let prefix = 'ipnpm:'

  if (cluster.isWorker) {
    prefix += `worker[${cluster.worker.id}]:`
  }

  const log = debug(prefix + name)
  log.error = debug(prefix + name + ':error')

  return log
}
