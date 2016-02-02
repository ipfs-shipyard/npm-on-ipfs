var ipfsAPI = require('ipfs-api')

module.exports = {
  apiCtl: ipfsAPI('/ip4/127.0.0.1/tcp/5001'),
  nodes: {
    biham: '/ip4/188.40.114.11/tcp/4001/ipfs/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E'
  },
  registryHash: '/ipns/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E',
  blobStore: {
    baseDir: '/npm-registry',
    port: 5001,
    host: '127.0.0.1'
  },
  mirror: {
    port: '9876',
    host: '127.0.0.1'
  }
}
