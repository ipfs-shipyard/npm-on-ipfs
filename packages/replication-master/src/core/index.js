'use strict'

const config = require('./config')
const clone = require('./clone')
const replicationMaster = require('./pubsub')
const server = require('registry-mirror-common/server')
const root = require('./root')

module.exports = async (options) => {
  options = config(options)

  const result = await server(options, async (app, ipfs) => {
    const res = await replicationMaster(options, ipfs, app)

    app.get('/', root(options, ipfs, app, res.root, res.topic))
  })

  clone(options, result.ipfs, result.app)

  return result
}
