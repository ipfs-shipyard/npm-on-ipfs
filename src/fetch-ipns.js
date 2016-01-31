const debug = require('debug')
const log = debug('registry-mirror')
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
  mv()

  function mv () {
    ctl.files.stat('/npm-registry', (err) => {
      if (err && err.code === 0) {
        return cp()
      }

      ctl.files.mv(['/npm-registry', '/npm-registry' + Date.now().toString()], (err) => {
        if (err) {
          return callback(err)
        }
        cp()
      })
    })
  }

  function cp () {
    ctl.name.resolve(ipns, (err, res) => {
      if (err) {
        return callback(err)
      }

      ctl.cat(res.Path, (err, stream) => {
        if (err) {
          return callback(err)
        }
        ctl.block.put(stream, (err, res) => {
          if (err) {
            return callback(err)
          }
          ctl.files.cp(['/ipfs/' + res.Key, '/npm-registry'], (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, '/ipfs/' + res.Path)
          })
        })
      })
    })
  }
}

