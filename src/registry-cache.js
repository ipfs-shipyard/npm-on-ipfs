const debug = require('debug')
const log = debug('registry-mirror')
const async = require('async')
log.error = debug('registry-mirror:error')
const config = require('./config')

exports = module.exports

exports.connect = (callback) => {
  // TODO support connection to more than one node
  // TODO check which nodes are missing from the list first
  config.apiCtl.swarm.connect(config.nodes.biham, callback)
}

exports.cacheRegistry = (callback) => {
  async.waterfall([
    (cb) => {
      config.apiCtl.name.resolve(config.registryHash, (err, res) => {
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

exports.publish = () => {
  config.apiCtl.files.stat('/npm-registry', function (err, res) {
    if (err) {
      return log.err('stat', err)
    }
    config.apiCtl.block.get(res.Hash, function (err, stream) {
      if (err) {
        return log.err('block get', err)
      }
      config.apiCtl.add(stream, function (err, res) {
        if (err) {
          return log.err('add', err)
        }
        config.apiCtl.name.publish('/ipfs/' + res[0].Hash, function (err, res) {
          if (err) {
            return log.err('name publish', err)
          }
          console.log('Published:')
          console.log('IPNS: ', '/ipns/' + res.Name)
          console.log('IPFS: ', res.Value)
        })
      })
    })
  })
}
