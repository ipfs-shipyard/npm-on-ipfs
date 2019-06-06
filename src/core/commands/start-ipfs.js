'use strict'

const IpfsApi = require('ipfs-http-client')
const ipfsdCtrl = require('ipfsd-ctl')
const which = require('which-promise')
const promisify = require('util').promisify
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

const spawn = (createArgs, spawnArgs = { init: true }) => {
  return new Promise((resolve, reject) => {
    ipfsdCtrl
      .create(createArgs)
      .spawn(spawnArgs, (error, node) => {
        if (error) {
          return reject(error)
        }

        resolve(node)
      })
  })
}

const startIpfs = async (config) => {
  if (config.ipfs.node === 'proc') {
    console.info(`😈 Spawning an in-process IPFS node using repo at ${config.ipfs.repo}`) // eslint-disable-line no-console

    const node = await spawn({
      type: 'proc',
      exec: require('ipfs')
    }, {
      disposable: false,
      repoPath: config.ipfs.repo
    })

    const initalise = promisify(node.init.bind(node))
    const start = promisify(node.start.bind(node))

    if (!node.initialized) {
      await initalise()
    }

    await start()

    return node
  } else if (config.ipfs.node === 'disposable') {
    console.info('😈 Spawning an in-process disposable IPFS node') // eslint-disable-line no-console

    return spawn({
      type: 'proc',
      exec: require('ipfs')
    })
  } else if (config.ipfs.node === 'js') {
    console.info('😈 Spawning a js-IPFS node') // eslint-disable-line no-console

    return spawn({
      type: 'js',
      exec: await which('jsipfs')
    })
  } else if (config.ipfs.node === 'go') {
    console.info('😈 Spawning a go-IPFS node') // eslint-disable-line no-console

    return spawn({
      type: 'go',
      exec: await which('ipfs')
    })
  }

  console.info(`😈 Connecting to a remote IPFS node at ${config.ipfs.node}`) // eslint-disable-line no-console

  return {
    api: new IpfsApi(config.ipfs.node),
    stop: (cb) => cb()
  }
}

const createIpfs = options => {
  return async () => {
    const ipfs = await startIpfs(options)

    cleanUpOps.push(() => {
      return new Promise((resolve) => {
        if (options.ipfs.node !== 'proc') {
          return resolve()
        }

        ipfs.stop(() => {
          console.info('😈 IPFS node stopped') // eslint-disable-line no-console

          resolve()
        })
      })
    })

    console.info('🗂️  Loading registry index from', options.registry) // eslint-disable-line no-console

    try {
      const mirror = await request(Object.assign({}, options.request, {
        uri: options.registry,
        json: true
      }))

      console.info('☎️  Dialling registry mirror', mirror.ipfs.addresses.join(',')) // eslint-disable-line no-console

      await timeout(
        Promise.race(
          mirror.ipfs.addresses.map(addr => {
            return ipfs.api.swarm.connect(mirror.ipfs.addresses[0])
          })
        ),
        options.registryConnectTimeout
      )

      console.info('📱️ Connected to registry') // eslint-disable-line no-console
    } catch (error) {
      console.info('📴 Not connected to registry') // eslint-disable-line no-console
    }

    return ipfs
  }
}

module.exports = createIpfs
