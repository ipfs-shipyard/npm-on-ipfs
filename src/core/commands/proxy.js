'use strict'

const config = require('../config')
const startIpfs = require('./start-ipfs')
const startServer = require('./start-server')
const rewriteLockfile = require('./rewrite-lock-file')
const request = require('ipfs-registry-mirror-common/utils/retry-request')
const {
  spawn
} = require('child_process')
const which = require('which-promise')
const timeout = require('ipfs-registry-mirror-common/utils/timeout-promise')
const OutputBuffer = require('output-buffer')

const cleanUpOps = []

const cleanUp = async () => {
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

  await timeout(
    Promise.race(
      mirror.ipfs.addresses.map(addr => {
        return ipfs.api.swarm.connect(mirror.ipfs.addresses[0])
      })
    ),
    options.registryConnectTimeout
  )
    .then(() => {
      console.info('📱️  Connected to registry') // eslint-disable-line no-console
    })
    .catch(() => {

    })

  console.info('👩‍🚀 Starting local proxy') // eslint-disable-line no-console

  const server = await startServer(options, ipfs.api)

  cleanUpOps.push(() => {
    return new Promise((resolve) => {
      server.close(() => {
        console.info('✋ Server stopped') // eslint-disable-line no-console
        resolve()
      })
    })
  })

  const packageManager = await which(options.packageManager)

  console.info(`🎁 Installing dependencies with ${packageManager}`) // eslint-disable-line no-console

  const proc = spawn(packageManager, [
    `--registry=http://localhost:${options.http.port}`
  ].concat(process.argv.slice(2)))

  const buffer = new OutputBuffer((line) => {
    console.info(`🐨 ${line}`) // eslint-disable-line no-console
  })

  proc.stdout.on('data', (data) => {
    buffer.append(data.toString())
  })

  proc.stderr.on('data', (data) => {
    buffer.append(data.toString())
  })

  proc.on('close', async (code) => {
    buffer.flush()

    console.log(`🎁 ${packageManager} exited with code ${code}`) // eslint-disable-line no-console

    await rewriteLockfile(options)

    await cleanUp()

    process.exit(code)
  })
}
