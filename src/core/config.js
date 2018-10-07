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
      uploadSizeLimit: option(process.env.MIRROR_UPLOAD_SIZE_LIMIT, overrides.mirrorUploadSizeLimit),
      registryUpdateInterval: option(process.env.REGISTRY_UPDATE_INTERVAL, overrides.registryUpdateInterval)
    },
    external: {
      host: option(process.env.EXTERNAL_HOST, overrides.externalHost),
      port: option(process.env.EXTERNAL_PORT, overrides.externalPort),
      protocol: option(process.env.EXTERNAL_PROTOCOL, overrides.externalProtocol)
    },
    ipfs: {
      port: option(process.env.IPFS_PORT, overrides.ipfsPort),
      host: option(process.env.IPFS_HOST, overrides.ipfsHost),
      repo: option(process.env.IPFS_REPO, overrides.ipfsRepo)
    },
    store: {
      type: option(process.env.STORE_TYPE, overrides.storeType),
      baseDir: option(process.env.IPFS_BASE_DIR, overrides.ipfsBaseDir),
      flush: option(toBoolean(process.env.IPFS_FLUSH), overrides.ipfsFlush),
      s3: {
        region: option(process.env.STORE_S3_REGION, overrides.storeS3Region),
        bucket: option(process.env.STORE_S3_BUCKET, overrides.storeS3Bucket),
        path: option(process.env.STORE_S3_PATH, overrides.storeS3Path),
        accessKeyId: option(process.env.STORE_S3_ACCESS_KEY_ID, overrides.storeS3AccessKeyId),
        secretAccessKey: option(process.env.STORE_S3_SECRET_ACCESS_KEY, overrides.storeS3SecretAccessKey),
        createIfMissing: option(process.env.STORE_S3_CREATE_IF_MISSING, overrides.createIfMissing)
      }
    },
    clone: {
      enabled: option(toBoolean(process.env.CLONE), overrides.clone),
      delay: option(process.env.CLONE_DELAY, overrides.cloneDelay),
      registry: option(process.env.CLONE_REGISTRY_URL, overrides.cloneRegistry),
      skim: option(process.env.CLONE_SKIM_URL, overrides.cloneSkim),
      upgradeToHttps: option(toBoolean(process.env.CLONE_UPGRADE_TO_HTTPS), overrides.cloneUpgradeToHttps),
      eagerDownload: option(toBoolean(process.env.CLONE_EAGER_DOWNLOAD), overrides.eagerDownload),
      userAgent: option(process.env.CLONE_USER_AGENT, overrides.cloneUserAgent),
      maxRequests: option(Number(process.env.IPFS_MAX_REQUESTS), overrides.ipfsMaxRequests),
      pubsub: {
        master: option(process.env.CLONE_PUBSUB_MASTER, overrides.clonePubsubMaster),
        topic: option(process.env.CLONE_PUBSUB_TOPIC, overrides.clonePubsubTopic)
      }
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
