'use strict'

const async = require('async')
const config = require('../config')

exports = module.exports

exports.connect = (api, callback) => {
  // TODO support connection to more than one node
  // TODO check which nodes are missing from the list first
  api.swarm.connect(config.nodes.biham, callback)
}

exports.cacheRegistry = (api, callback) => {
  async.waterfall([
    (cb) => {
      api.name.resolve(config.registryRecord, (err, res) => {
        cb(err, res.Path)
      })
    },
    (cb) => api.cat(cb),
    (stream, cb) => {
      api.block.put(stream, (err, res) => {
        cb(err, '/ipfs/' + res.Key)
      })
    },
    (ipfsHash, cb) => {
      api.files.mv(['/npm-registry', '/npm-registry.bak-' + Date.now().toString()], (err) => {
        if (err) { /* happens if /npm-registry did not exist yet, it is ok */ }
        cb(null, ipfsHash)
      })
    },
    (ipfsHash, cb) => {
      api.files.cp([ipfsHash, '/npm-registry'], (err) => {
        cb(err, ipfsHash)
      })
    }
  ], callback)
}

exports.publish = (api, callback) => {
  async.waterfall([
    (cb) => api.files.stat('/npm-registry', cb),
    (res, cb) => api.name.publish('/ipfs/' + res.Hash, cb)
  ], callback)
}
