'use strict'

const config = require('../config')
const startServer = require('./start-server')
const rewriteLockfile = require('./rewrite-lock-file')
const { spawn } = require('child_process')
const which = require('which-promise')

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

  console.info('👩‍🚀 Starting local proxy') // eslint-disable-line no-console

  const server = await startServer(options)

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
  ].concat(process.argv.slice(2)), {
    stdio: 'inherit'
  })

  proc.on('close', async (code) => {
    console.log(`🎁 ${packageManager} exited with code ${code}`) // eslint-disable-line no-console

    await rewriteLockfile(options)
    await cleanUp()

    process.exit(code)
  })
}
