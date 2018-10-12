'use strict'

const pkg = require('../../package.json')
const findBaseDir = require('registry-mirror-common/utils/find-base-dir')

let info
let lastUpdate

const findInfo = async (config, ipfs, root, topic) => {
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
      peers: peers.map(peer => peer.id.toB58String()),
      topic,
      // until js can resolve IPNS names remotely, just use the raw hash
      root: `/ipfs/${await findBaseDir(config, ipfs)}`
    }

    lastUpdate = Date.now()
  }

  return info
}

module.exports = (config, ipfs, app, root, topic) => {
  return async (request, response, next) => {
    try {
      const info = await findInfo(config, ipfs, root, topic)

      response.statusCode = 200
      response.setHeader('Content-type', 'application/json; charset=utf-8')
      response.send(JSON.stringify(info, null, request.query.format === undefined ? 0 : 2))
    } catch (error) {
      response.statusCode = 500
      response.setHeader('Content-type', 'application/text; charset=utf-8')
      response.send(error)
    }
  }
}
