'use strict'

const config = require('./config')
const startIpfs = require('./start-ipfs')
const startServer = require('./start-server')
const request = require('registry-mirror-common/utils/retry-request')
const { spawn } = require('child_process')
const which = require('which-promise')
var OutputBuffer = require('output-buffer')

const cleanUpOps = []

const cleanUp = async () => {
  return Promise.all(
    cleanUpOps.map(op => op())
  )
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

  const master = await request(Object.assign({}, options.request, {
    url: options.ipfs.index,
    json: true
  }))

  console.info('🗑️  Removing old registry if it exists')

  try {
    await ipfs.api.files.rm(options.ipfs.prefix, {
      recursive: true
    })
  } catch (error) {

  }

  console.info('☎️  Dialing replication master', master.ipfs.addresses[master.ipfs.addresses.length - 1])

  await ipfs.api.swarm.connect(master.ipfs.addresses[master.ipfs.addresses.length - 1])

  console.info('📠 Copying registry index', master.root, 'to', options.ipfs.prefix)

  await ipfs.api.files.cp(master.root, options.ipfs.prefix)

  console.info('👩‍🚀 Starting local webserver')

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

  console.info(`🎁 Installing dependencies with ${packageManager}`)

  const proc = spawn(packageManager, ['install', `--registry=http://localhost:${options.http.port}`, '--loglevel=http']);

  const buffer = new OutputBuffer((line) => {
    console.info(`🐨 ${line}`)
  })

  proc.stdout.on('data', (data) => {
    buffer.append(data.toString())
  })

  proc.stderr.on('data', (data) => {
    buffer.append(data.toString())
  })

  proc.on('close', async (code) => {
    buffer.flush()

    console.log(`🎁 ${packageManager} exited with code ${code}`)

    await cleanUp()

    process.exit(code)
  })
}
