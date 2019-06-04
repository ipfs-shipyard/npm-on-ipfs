'use strict'

const config = require('../config')
const startIpfs = require('./start-ipfs')
const request = require('ipfs-registry-mirror-common/utils/retry-request')
const timeout = require('ipfs-registry-mirror-common/utils/timeout-promise')

const cleanUpOps = []

const cleanUp = () => {
  Promise.all(
    cleanUpOps.map(op => op())
  )
    .then(() => {
      process.exit(0)
    })
}

process.on('SIGTERM', cleanUp)
process.on('SIGINT', cleanUp)

module.exports = async (options) => {
  options = config(options)

  const ipfs = await startIpfs(options)

  cleanUpOps.push(() => {
    return new Promise((resolve) => {
      if (options.ipfs.node !== 'proc') {
        return resolve()
      }

      ipfs.stop(() => {
        console.info('👿 IPFS node stopped') // eslint-disable-line no-console
        resolve()
      })
    })
  })

  console.info('🗂️  Loading registry index from', options.registry) // eslint-disable-line no-console

  const mirror = await request(Object.assign({}, options.request, {
    uri: options.registry,
    json: true
  }))

  console.info('☎️  Dialling registry mirror', mirror.ipfs.addresses.join(',')) // eslint-disable-line no-console

  let connected

  await timeout(
    Promise.race(
      mirror.ipfs.addresses.map(addr => {
        return ipfs.api.swarm.connect(mirror.ipfs.addresses[0])
      })
    ),
    options.registryConnectTimeout
  )
    .then(() => {
      connected = true
    })
    .catch(() => {
      connected = false
    })

  if (connected) {
    const tempPath = `${options.ipfs.prefix}-${Date.now()}`

    console.info('📠 Copying registry index', mirror.root, 'to', tempPath) // eslint-disable-line no-console

    try {
      await ipfs.api.files.rm(tempPath, {
        recursive: true
      })
    } catch (e) {
      // ignore
    }

    await ipfs.api.files.cp(mirror.root, tempPath)

    console.info('💌 Copied registry index', mirror.root, 'to', tempPath) // eslint-disable-line no-console

    console.info('🗑️  Replacing old registry index if it exists') // eslint-disable-line no-console

    try {
      await ipfs.api.files.rm(options.ipfs.prefix, {
        recursive: true
      })
    } catch (e) {
      // ignore
    }

    await ipfs.api.files.mv(tempPath, options.ipfs.prefix)
  }

  await cleanUp()
}
