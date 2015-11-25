var spawn = require('child_process').spawn
var path = require('path')
var logger = require('./logger')

exports = module.exports = clone

function clone (config) {
  var opts = ['-o', config.outputDir, '-d', 'localhost']

  // add a custom blob-store
  if (config.blobStore) {
    opts.push('--blobstore=' + config.blobStore)
  }

  var child = spawn(
    path.resolve(
      require.resolve('registry-static'), '../../bin/registry-static'),
      opts,
    {
      stdio: 'inherit'
    }
  )

  process.on('SIGINT', function () {
    child.kill('SIGINT')
    process.kill()
  })

  logger.info('Cloning NPM from https://registry.npmjs.org')
}
