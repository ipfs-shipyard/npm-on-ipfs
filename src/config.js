var ipfsAPI = require('ipfs-api')

module.exports = {
  apiCtl: ipfsAPI('/ip4/127.0.0.1/tcp/5001')
}
