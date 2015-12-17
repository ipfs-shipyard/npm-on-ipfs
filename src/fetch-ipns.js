var logger = require('./logger')
var ipfsAPI = require('ipfs-api')

exports = module.exports = fetchIPNS

// TODO update this to enable multiple nodes to be our
var updaterNodes = {
  castor: {
    addr: '/ip4/37.59.33.238/tcp/4001/ipfs/QmdNc4B89DxVeiuDKRN5bWdKsAPCmekgmJMkRSdUNa7x9z',
    ipns: '/ipns/qmdnc4b89dxveiudkrn5bwdksapcmekgmjmkrsduna7x9z'
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

    apiCtl.swarm.connect(updaterNodes.castor.addr, function (err) {
      if (err) {
        return callback(err)
      }
      copyNpmRegistry(apiCtl, updaterNodes.castor.ipns, callback)
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

      ctl.files.cp([res.Path, '/npm-registry'], function (err) {
        if (err) { return callback(err) }
        callback(null, res.Path)
      })
    })
  }
}

