'use strict'

module.exports = (overrides) => {
  return {
    mirror: {
      host: process.env.MIRROR_HOST || overrides.mirrorHost,
      port: process.env.MIRROR_PORT || overrides.mirrorPort,
      protocol: process.env.MIRROR_PROTOCOL || overrides.mirrorProtocol,
      registry: process.env.MIRROR_REGISTRY || overrides.mirrorRegistry
    },
    store: {
      port: process.env.IPFS_PORT || overrides.ipfsPort,
      host: process.env.IPFS_HOST || overrides.ipfsHost,
      baseDir: process.env.IPFS_BASE_DIR || overrides.ipfsBaseDir,
      flush: Boolean(process.env.IPFS_FLUSH) || overrides.ipfsFlush
    },
    clone: {
      enabled: Boolean(process.env.CLONE_ENABLED) || overrides.clone,
      delay: process.env.CLONE_DELAY || overrides.cloneDelay,
      registry: process.env.CLONE_REGISTRY_URL || overrides.cloneRegistry,
      skim: process.env.CLONE_SKIM_URL || overrides.cloneSkim,
      upgradeToHttps: Boolean(process.env.CLONE_UPGRADE_TO_HTTPS) || overrides.cloneUpgradeToHttps,
      downloadTarballs: Boolean(process.env.CLONE_DOWNLOAD_TARBALLS) || overrides.cloneTarballs,
      userAgent: process.env.CLONE_USER_AGENT || overrides.cloneUserAgent
    },
    request: {
      pool: {
        maxSockets: Number(process.env.REQUEST_MAX_SOCKETS) || overrides.requestMaxSockets
      }
    }
  }
}
