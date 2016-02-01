const debug = require('debug')
const log = debug('registry-mirror')
const async = require('async')
log.error = debug('registry-mirror:error')
const config = require('./config')

exports = module.exports

exports.connect = (callback) => {
  // TODO support connection to more than one node
  // TODO check which nodes are missing from the list first
  const updaterNodes = {
    biham: '/ip4/188.40.114.11/tcp/4001/ipfs/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E'
  }

  config.apiCtl.swarm.connect(updaterNodes.biham, callback)
}

exports.cacheRegistry = (callback) => {
  var registry = '/ipns/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E'

  async.waterfall([
    (cb) => {
      config.apiCtl.name.resolve(registry, (err, res) => {
        cb(err, res.Path)
      })
    },
    config.apiCtl.cat,
    (stream, cb) => {
      config.apiCtl.block.put(stream, (err, res) => {
        cb(err, '/ipfs/' + res.Key)
      })
    },
    (ipfsHash, cb) => {
      config.apiCtl.files.mv(['/npm-registry', '/npm-registry.bak-' + Date.now().toString()], (err) => {
        cb(err, ipfsHash)
      })
    },
    (ipfsHash, cb) => {
      config.apiCtl.files.cp([ipfsHash, '/npm-registry'], (err) => {
        cb(err, ipfsHash)
      })
    }
  ], (err, ipfsHash) => {
    callback(err, ipfsHash)
  })
}

