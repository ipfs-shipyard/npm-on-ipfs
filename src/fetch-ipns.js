const debug = require('debug')
const log = debug('registry-mirror')
const async = require('async')
log.error = debug('registry-mirror:error')
const ipfsAPI = require('ipfs-api')

// TODO update this to enable multiple nodes to be our
const updaterNodes = {
  biham: {
    addr: '/ip4/188.40.114.11/tcp/4001/ipfs/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E',
    ipns: '/ipns/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E'
  }
}

exports = module.exports = (config, callback) => {
  if (!callback) { callback = (err) => { if (err) { log.err(err) } } }

  if (!config.clone && config.blobStore) {
    const apiCtl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    apiCtl.swarm.connect(updaterNodes.biham.addr, (err) => {
      if (err) { return callback(err) }
      copyNpmRegistry(apiCtl, updaterNodes.biham.ipns, callback)
    })
  }
}

exports.copyNpmRegistry = copyNpmRegistry
function copyNpmRegistry (ctl, ipns, callback) {
  async.waterfall([
    (cb) => {
      ctl.name.resolve(ipns, (err, res) => {
        cb(err, res.Path)
      })
    },
    ctl.cat,
    (stream, cb) => {
      ctl.block.put(stream, (err, res) => {
        cb(err, '/ipfs/' + res.Key)
      })
    },
    (ipfsHash, cb) => {
      ctl.files.mv(['/npm-registry', '/npm-registry.bak-' + Date.now().toString()], (err) => {
        cb(err, ipfsHash)
      })
    },
    (ipfsHash, cb) => {
      ctl.files.cp([ipfsHash, '/npm-registry'], (err) => {
        cb(err, ipfsHash)
      })
    }
  ], (err, ipfsHash) => {
    callback(err, ipfsHash)
  })
}

