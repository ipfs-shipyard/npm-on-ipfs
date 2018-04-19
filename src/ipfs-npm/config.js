'use strict'

const debug = require('debug')
const path = require('path')
const os = require('os')
const log = debug('ipnpm')
log.err = debug('ipnpm:err')

const tmp = os.tmpdir()

module.exports = {
  log: log,
  nodes: {
    biham: '/ip4/188.40.114.11/tcp/8801/ipfs/QmToeN85brexqyXUnWnKfHFqhvucJPViw9AxQQkjLoULy4'
  },
  registryRecord: '/ipns/QmToeN85brexqyXUnWnKfHFqhvucJPViw9AxQQkjLoULy4',
  mirror: {
    port: '9876',
    host: '127.0.0.1'
  },
  writeLimit: 100,
  protocol: 'https',
  registry: 'registry.npmjs.com',
  skim: 'https://replicate.npmjs.com/registry',
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
