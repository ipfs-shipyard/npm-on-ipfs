var logger = require('./logger')
var ipfsAPI = require('ipfs-api')

exports = module.exports = fetchIPNS

// TODO update this to enable multiple nodes to be our
var updaterNodes = {
  castor: {
    addr: '/ip4/37.59.33.238/tcp/4001/ipfs/QmdNc4B89DxVeiuDKRN5bWdKsAPCmekgmJMkRSdUNa7x9z',
    ipns: '/ipns/QmdNc4B89DxVeiuDKRN5bWdKsAPCmekgmJMkRSdUNa7x9z'
  },
  biham: {
    addr: '/ip4/188.40.114.11/tcp/4001/ipfs/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E',
    ipns: '/ipns/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E'
  }
}

function fetchIPNS (config, callback) {
  if (!callback) {
    callback = function (err) {
      if (err) {
        logger.err(err)
      }
    }
  }

  if (!config.clone && config.blobStore) {
    var apiCtl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    apiCtl.swarm.connect(updaterNodes.biham.addr, function (err) {
      if (err) {
        return callback(err)
      }
      copyNpmRegistry(apiCtl, updaterNodes.biham.ipns, callback)
    })
  }
}

exports.copyNpmRegistry = copyNpmRegistry
function copyNpmRegistry (ctl, ipns, callback) {
  mv()

  function mv () {
    ctl.files.stat('/npm-registry', function (err) {
      if (err && err.code === 0) {
        return cp()
      }

      ctl.files.mv(['/npm-registry', '/npm-registry' + Date.now().toString()], function (err) {
        if (err) {
          return callback(err)
        }
        cp()
      })
    })
  }

  function cp () {
    ctl.name.resolve(ipns, function (err, res) {
      if (err) {
        return callback(err)
      }

      ctl.cat(res.Path, function (err, stream) {
        if (err) {
          return callback(err)
        }
        ctl.block.put(stream, function (err, res) {
          if (err) {
            return callback(err)
          }
          ctl.files.cp(['/ipfs/' + res.Key, '/npm-registry'], function (err) {
            if (err) {
              return callback(err)
            }
            callback(null, '/ipfs/' + res.Key)
          })
        })
      })
    })
  }
}

