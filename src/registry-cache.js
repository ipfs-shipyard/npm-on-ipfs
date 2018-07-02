'use strict'

const debug = require('debug')
const log = debug('registry-mirror')
const async = require('async')
log.err = debug('registry-mirror:error')
const config = require('./config')
const api = config.apiCtl
const parallel = require('async/parallel')

exports = module.exports

exports.connect = (callback) => {
  // TODO check which nodes are missing from the list first
  parallel(
    config.nodes.map(node => {
      log('Connecting to', node)
      return (cb) => api.swarm.connect(node, (error) => {
        if (error) {
          log('Failed to connect to', node)
        } else {
          log('Connected to', node)
        }

        // record that connecting to this node failed but don't stop trying
        // to connect to other nodes
        cb(null, error)
      })
    }),
    (error, results) => {
      if (error) {
        return callback(error)
      }

      const connected = results
        .filter(result => result instanceof Error)
        .length < config.nodes.length

      if (connected) {
        return callback()
      } else {
        return callback(new Error('Could not connect to any nodes'))
      }
    }
  )
}

exports.cacheRegistry = (callback) => {
  async.waterfall([
    (cb) => {
      log('Resolving', config.registryRecord)
      api.name.resolve(config.registryRecord, (err, res) => {
        cb(err, res && res.Path)
      })
    },
    api.cat,
    (stream, cb) => {
      api.block.put(stream, (err, res) => {
        cb(err, res && '/ipfs/' + res.Key)
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

exports.publish = () => {
  api.files.stat(config.blobStore.baseDir, (err, res) => {
    if (err) {
      return log.err('stat', err)
    }

    api.block.get(res.hash, (err, block) => {
      if (err) {
        return log.err('block get', err)
      }

      api.add(block.data, (err, res) => {
        if (err) {
          return log.err('add', err)
        }

        api.name.publish('/ipfs/' + res[0].hash, {}, (err, res) => {
          if (err) {
            return log.err('name publish', err)
          }

          console.log('Published:')
          console.log('IPNS: ', '/ipns/' + res.name)
          console.log('IPFS: ', res.value)
        })
      })
    })
  })
}
