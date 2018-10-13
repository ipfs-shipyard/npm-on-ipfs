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

  console.info('🗑️  Removing old registry if it exists') // eslint-disable-line no-console

  try {
    await ipfs.api.files.rm(options.ipfs.prefix, {
      recursive: true
    })
  } catch (error) {

  }

  console.info('☎️  Dialing replication master', master.ipfs.addresses.join(',')) // eslint-disable-line no-console

  let connected

  await Promise.all(
    master.ipfs.addresses.map(addr => {
      return ipfs.api.swarm.connect(master.ipfs.addresses[0])
        .then(() => {
          connected = true
        })
        .catch(() => {})
    })
  )

  if (!connected) {
    throw new Error('💥 Could not connect to replication master - tried ' + master.ipfs.addresses.join(','))
  }

  console.info('📠 Copying registry index', master.root, 'to', options.ipfs.prefix) // eslint-disable-line no-console

  await ipfs.api.files.cp(master.root, options.ipfs.prefix)

  console.info('👩‍🚀 Starting local webserver') // eslint-disable-line no-console

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

  const proc = spawn(packageManager, ['install', `--registry=http://localhost:${options.http.port}`, '--loglevel=http'])

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

    await cleanUp()

    process.exit(code)
  })
}
