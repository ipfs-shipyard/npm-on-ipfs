'use strict'

const toBoolean = require('ipfs-registry-mirror-common/utils/to-boolean')
const option = require('ipfs-registry-mirror-common/utils/option')

module.exports = (overrides = {}) => {
  return {
    packageManager: option(process.env.PACKAGE_MANAGER, overrides.packageManager),
    registry: option(process.env.IPFS_REGISTRY, overrides.ipfsRegistry),
    registryUpdateInterval: option(Number(process.env.REGISTRY_UPDATE_INTERVAL), overrides.registryUpdateInterval),
    registryUploadSizeLimit: option(process.env.MIRROR_UPLOAD_SIZE_LIMIT, overrides.registryUploadSizeLimit),
    registryConnectTimeout: option(Number(process.env.REGISTRY_CONNECT_TIMEOUT), overrides.registryConnectTimeout),
    registryReadTimeout: option(Number(process.env.REGISTRY_READ_TIMEOUT), overrides.registryReadTimeout),

    ipfs: {
      host: option(process.env.IPFS_HOST, overrides.ipfsHost),
      port: option(Number(process.env.IPFS_PORT), overrides.ipfsPort),
      node: option(process.env.IPFS_NODE, overrides.ipfsNode),
      prefix: option(process.env.IPFS_MFS_PREFIX, overrides.ipfsMfsPrefix),
      flush: option(process.env.IPFS_FLUSH, overrides.ipfsFlush),
      repo: option(process.env.IPFS_REPO, overrides.ipfsRepo)
    },

    npm: {
      registry: option(process.env.NPM_REGISTRY, overrides.npmRegistry)
    },

    http: {
      host: 'localhost'
    },

    request: {
      pool: {
        maxSockets: option(Number(process.env.REQUEST_MAX_SOCKETS), overrides.requestMaxSockets)
      },
      retries: option(process.env.REQUEST_RETRIES, overrides.requestRetries),
      retryDelay: option(process.env.REQUEST_RETRY_DELAY, overrides.requestRetryDelay),
      timeout: option(process.env.REQUEST_TIMEOUT, overrides.requestTimeout)
    }
  }
}

module.exports.option = option
module.exports.toBoolean = toBoolean
