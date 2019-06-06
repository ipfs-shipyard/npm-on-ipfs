'use strict'

const request = require('ipfs-registry-mirror-common/utils/retry-request')
const config = require('../config')
const startIpfs = require('./start-ipfs')

module.exports = async (options) => {
  options = config(options)

  const ipfs = await startIpfs(options)()

  const mirror = await request(Object.assign({}, options.request, {
    uri: options.registry,
    json: true
  }))

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
