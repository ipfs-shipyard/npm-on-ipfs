'use strict'

const pkg = require('../../../package.json')

module.exports = (options, ipfs, app) => {
  return async (request, response, next) => {
    const [
      id,
      peers
    ] = await Promise.all([
      request.app.locals.ipfs.id(),
      request.app.locals.ipfs.swarm.addrs()
    ])

    response.statusCode = 200
    response.setHeader('Content-type', 'application/json; charset=utf-8')
    response.send(JSON.stringify({
      name: pkg.name,
      version: pkg.version,
      ipfs: id,
      peers: peers.map(peer => {
        const info = peer.id.toJSON()

        return {
          id: info.id,
          publicKey: info.pubKey,
          addresses: peer.multiaddrs.toArray().map(multiaddr => multiaddr.toString())
        }
      })
    }, null, request.query.format === undefined ? 0 : 2))
  }
}
