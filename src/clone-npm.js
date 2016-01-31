const spawn = require('child_process').spawn
const path = require('path')
const debug = require('debug')
const log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

module.exports = (config) => {
  const opts = [
    '-o', config.outputDir,
    '-d', 'localhost'
  ]

  if (config.blobStore) { opts.push('--blobstore=' + config.blobStore) }

  const rspath = path.resolve(require.resolve('registry-static'), '../../bin/registry-static')
  const child = spawn(rspath, opts, { stdio: 'inherit' })

  process.on('SIGINT', () => {
    child.kill('SIGINT')
    process.kill()
  })

  log('cloning NPM from https://registry.npmjs.org')
}
