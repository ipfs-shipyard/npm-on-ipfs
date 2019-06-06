'use strict'

const log = require('debug')('ipfs:ipfs-npm:handlers:manifest')
const loadManifest = require('ipfs-registry-mirror-common/utils/load-manifest')
const sanitiseName = require('ipfs-registry-mirror-common/utils/sanitise-name')
const lol = require('ipfs-registry-mirror-common/utils/error-message')
const getExternalUrl = require('ipfs-registry-mirror-common/utils/get-external-url')

const replaceTarballUrls = (pkg, config) => {
  const prefix = getExternalUrl(config)
  const packageName = pkg.name
  const moduleName = packageName.startsWith('@') ? packageName.split('/').pop() : packageName

  // change tarball URLs to point to us
  Object.keys(pkg.versions || {})
    .forEach(versionNumber => {
      const version = pkg.versions[versionNumber]

      version.dist.tarball = `${prefix}/${packageName}/-/${moduleName}-${versionNumber}.tgz`
    })

  return pkg
}

module.exports = (config, app) => {
  return async (request, response, next) => {
    log(`Requested ${request.path}`)

    let moduleName = sanitiseName(request.path)

    log(`Loading manifest for ${moduleName}`)

    const ipfs = await request.app.locals.ipfs()

    try {
      const manifest = await loadManifest(config, ipfs.api, moduleName)

      // because we start the server on a random high port, the previously stored
      // manifests may have port numbers from the last time we ran, so overwrite
      // them before returning them to the client
      replaceTarballUrls(manifest, config)

      response.statusCode = 200
      response.setHeader('Content-type', 'application/json; charset=utf-8')
      response.send(JSON.stringify(manifest, null, request.query.format === undefined ? 0 : 2))
    } catch (error) {
      console.error(`💥 Could not load manifest for ${moduleName}`, error) // eslint-disable-line no-console

      if (error.message.includes('Not found')) {
        response.statusCode = 404
        response.send(lol(`💥 Could not load ${moduleName}, has it been published?`))

        return
      }

      // a 500 will cause the npm client to retry
      response.statusCode = 500
      response.send(lol(`💥 ${error.message}`))
    }
  }
}
