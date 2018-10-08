'use strict'

const hat = require('hat')
const findBaseDir = require('./find-base-dir')

const topic = `ipfs-registry-pubsub-${hat()}`

const publishIpnsName = async (config, ipfs) => {
  const baseDir = await findBaseDir(config, ipfs)

  console.info(`🗞️  Publishing IPNS update, base dir is /ipfs/${baseDir}`) // eslint-disable-line no-console

  return `/ipns/${await ipfs.name.publish(`/ipfs/${baseDir}`)}`
}

const publishUpdate = async (config, ipfs, pkg) => {
  await ipfs.pubsub.publish(topic, Buffer.from(JSON.stringify({
    type: 'update',
    manifest: pkg
  })))
}

const master = async (config, ipfs, emitter) => {
  emitter.on('processed', async (pkg) => {
    try {
      await publishIpnsName(config, ipfs)
      console.info(`📰 Published IPNS update`) // eslint-disable-line no-console
    } catch (error) {
      console.error(`💥 Error publishing IPNS name - ${error}`) // eslint-disable-line no-console
    }

    try {
      await publishUpdate(config, ipfs, pkg)
      console.info(`📰 Broadcast update of ${pkg.name} module`) // eslint-disable-line no-console
    } catch (error) {
      console.error('💥 Error publishing to topic', error) // eslint-disable-line no-console
    }
  })

  try {
    const root = await publishIpnsName(config, ipfs)

    return {
      topic,
      root
    }
  } catch (error) {
    throw error
  }
}

module.exports = master
