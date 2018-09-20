'use strict'

const toBoolean = (value) => {
  if (value === undefined) {
    return undefined
  }

  if (value === 'false' || value === '0' || value === 'no') {
    return false
  }

  if (value === 'true' || value === '1' || value === 'yes') {
    return true
  }

  return Boolean(value)
}

function option () {
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]

    if (arg !== undefined && arg !== null && arg.toString() !== 'NaN') {
      return arg
    }
  }
}

module.exports = (overrides = {}) => {
  return {
    mirror: {
      host: option(process.env.MIRROR_HOST, overrides.mirrorHost),
      port: option(process.env.MIRROR_PORT, overrides.mirrorPort),
      protocol: option(process.env.MIRROR_PROTOCOL, overrides.mirrorProtocol),
      registry: option(process.env.MIRROR_REGISTRY, overrides.mirrorRegistry),
      uploadSizeLimit: option(process.env.MIRROR_UPLOAD_SIZE_LIMIT, overrides.mirrorUploadSizeLimit)
    },
    external: {
      host: option(process.env.EXTERNAL_HOST, overrides.externalHost),
      port: option(process.env.EXTERNAL_PORT, overrides.externalPort),
      protocol: option(process.env.EXTERNAL_PROTOCOL, overrides.externalProtocol)
    },
    ipfs: {
      port: option(process.env.IPFS_PORT, overrides.ipfsPort),
      host: option(process.env.IPFS_HOST, overrides.ipfsHost)
    },
    store: {
      baseDir: option(process.env.IPFS_BASE_DIR, overrides.ipfsBaseDir),
      flush: option(toBoolean(process.env.IPFS_FLUSH), overrides.ipfsFlush)
    },
    clone: {
      enabled: option(toBoolean(process.env.CLONE), overrides.clone),
      delay: option(process.env.CLONE_DELAY, overrides.cloneDelay),
      registry: option(process.env.CLONE_REGISTRY_URL, overrides.cloneRegistry),
      skim: option(process.env.CLONE_SKIM_URL, overrides.cloneSkim),
      upgradeToHttps: option(toBoolean(process.env.CLONE_UPGRADE_TO_HTTPS), overrides.cloneUpgradeToHttps),
      eagerDownload: option(toBoolean(process.env.CLONE_EAGER_DOWNLOAD), overrides.eagerDownload),
      userAgent: option(process.env.CLONE_USER_AGENT, overrides.cloneUserAgent),
      maxRequests: option(Number(process.env.IPFS_MAX_REQUESTS), overrides.ipfsMaxRequests)
    },
    request: {
      pool: {
        maxSockets: option(Number(process.env.REQUEST_MAX_SOCKETS), overrides.requestMaxSockets)
      }
    }
  }
}

module.exports.option = option
module.exports.toBoolean = toBoolean
