'use strict'

const pkg = require('../../package.json')

let info
let lastUpdate

const findInfo = async (config, ipfs) => {
  if (!lastUpdate || lastUpdate < (Date.now() - 30000)) {
    const [
      id,
      peers
    ] = await Promise.all([
      ipfs.id(),
      ipfs.swarm.addrs()
    ])

    id.addresses = [
      `/ip4/${config.external.ip}/tcp/${config.ipfs.port}/ipfs/${id.id}`,
      `/dns4/${config.external.host}/tcp/${config.ipfs.port}/ipfs/${id.id}`
    ]

    info = {
      name: pkg.name,
      version: pkg.version,
      ipfs: id,
      peers: peers.map(peer => peer.id.toB58String())
    }

    lastUpdate = Date.now()
  }

  return info
}

module.exports = (config, ipfs, app) => {
  return async (request, response, next) => {
    response.statusCode = 200
    response.setHeader('Content-type', 'application/json; charset=utf-8')
    response.send(JSON.stringify(await findInfo(config, request.app.locals.ipfs), null, request.query.format === undefined ? 0 : 2))
  }
}
