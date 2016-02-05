const ipfsAPI = require('ipfs-api')
const debug = require('debug')
const path = require('path')
const os = require('os')
const log = debug('mirror')
log.err = debug('mirror:err')

const tmp = os.tmpdir()

module.exports = {
  log: log,
  apiCtl: ipfsAPI('/ip4/127.0.0.1/tcp/5001'),
  nodes: {
    biham: '/ip4/188.40.114.11/tcp/4001/ipfs/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E'
  },
  registryRecord: '/ipns/QmZY7MtK8ZbG1suwrxc7xEYZ2hQLf1dAWPRHhjxC8rjq8E',
  mirror: {
    port: '9876',
    host: '127.0.0.1'
  },
  limit: 10,
  registry: 'http://registry.npmjs.org/',
  tmp: tmp,
  error: path.join(__dirname, '../defaults', '404.json'),
  seqFile: path.join(tmp, 'registry-mirror.seq'),
  domain: 'npm.ipfs.io',
  blobStore: {
    baseDir: '/npm-registry/',
    port: 5001,
    host: '127.0.0.1',
    flush: true
  }
}
