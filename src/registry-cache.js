const debug = require('debug')
const log = debug('registry-mirror')
const async = require('async')
log.error = debug('registry-mirror:error')
const config = require('./config')
const api = config.apiCtl

exports = module.exports

exports.connect = (callback) => {
  // TODO support connection to more than one node
  // TODO check which nodes are missing from the list first
  api.swarm.connect(config.nodes.biham, callback)
}

exports.cacheRegistry = (callback) => {
  async.waterfall([
    (cb) => {
      api.name.resolve(config.registryHash, (err, res) => {
        cb(err, res.Path)
      })
    },
    api.cat,
    (stream, cb) => {
      api.block.put(stream, (err, res) => {
        cb(err, '/ipfs/' + res.Key)
      })
    },
    (ipfsHash, cb) => {
      api.files.mv(['/npm-registry', '/npm-registry.bak-' + Date.now().toString()], (err) => {
        cb(err, ipfsHash)
      })
    },
    (ipfsHash, cb) => {
      api.files.cp([ipfsHash, '/npm-registry'], (err) => {
        cb(err, ipfsHash)
      })
    }
  ], callback)
}

exports.publish = () => {
  api.files.stat('/npm-registry', function (err, res) {
    if (err) {
      return log.err('stat', err)
    }
    api.block.get(res.Hash, function (err, stream) {
      if (err) {
        return log.err('block get', err)
      }
      api.add(stream, function (err, res) {
        if (err) {
          return log.err('add', err)
        }
        api.name.publish('/ipfs/' + res[0].Hash, function (err, res) {
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
