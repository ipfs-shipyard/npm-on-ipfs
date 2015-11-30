var logger = require('./logger')
var ipfsAPI = require('ipfs-api')

exports = module.exports = fetchIPNS

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

    var castorAddr = '/ip4/37.59.33.238/tcp/4001/ipfs/QmdNc4B89DxVeiuDKRN5bWdKsAPCmekgmJMkRSdUNa7x9z'
    apiCtl.swarm.connect(castorAddr, function (err) {
      if (err) { return callback(err) }

      apiCtl.files.stat('/npm-registry', function (err) {
        if (err && err.code === 0) {
          return copyNpmRegistry()
        }

        apiCtl.files.mv(['/npm-registry', '/npm-registry' + Date.now().toString()], function (err) {
          if (err) { return callback(err) }

          copyNpmRegistry()
        })

        function copyNpmRegistry () {
          apiCtl.name.resolve('/ipns/QmdNc4B89DxVeiuDKRN5bWdKsAPCmekgmJMkRSdUNa7x9z', function (err, res) {
            if (err) { return callback(err) }

            // logger.info('New /npm-registry mDAG node:', res.Path)
            apiCtl.files.cp([res.Path, '/npm-registry'], function (err) {
              if (err) { return callback(err) }
              callback(null, res.Path)
            })
          })
        }
      })
    })
  }
}
