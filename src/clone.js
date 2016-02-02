const spawn = require('child_process').spawn
const path = require('path')
const debug = require('debug')
const log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

module.exports = () => {
  const opts = [
    '-o', '/npm-registry/',
    '-d', 'localhost',
    '--blobstore=' + path.resolve(__dirname, 'ibs.js')
  ]

  const rspath = path.resolve(require.resolve('registry-static'), '../../bin/registry-static')
  const child = spawn(rspath, opts, { stdio: 'inherit' })

  process.on('SIGINT', () => {
    child.kill('SIGINT')
    process.kill()
  })

  log('cloning NPM from https://registry.npmjs.org')
}
