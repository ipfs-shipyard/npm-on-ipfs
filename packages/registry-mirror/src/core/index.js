'use strict'

const proxy = require('express-http-proxy')
const config = require('./config')
const replicationWorker = require('./pubsub')
const getExternalUrl = require('registry-mirror-common/utils/get-external-url')
const server = require('registry-mirror-common/server')
const tarball = require('./tarball')
const manifest = require('./manifest')
const root = require('./root')

module.exports = async (options) => {
  options = config(options)

  const result = await server(options, async (app, ipfs) => {
    app.get('/', root(options, ipfs, app))

    // intercept requests for tarballs and manifests
    app.get('/*.tgz', tarball(options, ipfs, app))
    app.get('/*', manifest(options, ipfs, app))

    // everything else should just proxy for the registry
    const registry = proxy(options.registry, {
      limit: options.registryUploadSizeLimit
    })
    app.put('/*', registry)
    app.post('/*', registry)
    app.patch('/*', registry)
    app.delete('/*', registry)

    await replicationWorker(options, ipfs, app)
  })

  let url = getExternalUrl(options)

  console.info(`🔧 Please either update your npm config with 'npm config set registry ${url}'`) // eslint-disable-line no-console
  console.info(`🔧 or use the '--registry' flag, eg: 'npm install --registry=${url}'`) // eslint-disable-line no-console

  return result
}
