'use strict'

const S3 = require('aws-sdk/clients/s3')
const S3Store = require('datastore-s3')
const S3Lock = require('datastore-s3/examples/full-s3-repo/s3-lock')
const IPFSRepo = require('ipfs-repo')

const s3Repo = ({ region, bucket, path, accessKeyId, secretAccessKey, createIfMissing }) => {
  path = path || process.env.HOSTNAME

  const storeconfig = {
    s3: new S3({
      params: {
        Bucket: bucket
      },
      region,
      accessKeyId,
      secretAccessKey
    }),
    createIfMissing
  }

  return new IPFSRepo(path, {
    storageBackends: {
      root: S3Store,
      blocks: S3Store,
      keys: S3Store,
      datastore: S3Store
    },
    storageBackendconfig: {
      root: storeconfig,
      blocks: storeconfig,
      keys: storeconfig,
      datastore: storeconfig
    },
    lock: new S3Lock(new S3Store('', storeconfig))
  })
}

module.exports = s3Repo
