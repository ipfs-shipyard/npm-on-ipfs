'use strict'

const findBaseDir = async (config, ipfs) => {
  const parts = config.ipfs.prefix.split('/')
  const name = parts.pop()
  const rest = `/${parts.join('/')}`

  const node = (await ipfs.files.ls(rest, {
    long: true
  }))
    .filter(item => item.name === name)
    .pop()

  if (node) {
    return node.hash
  }

  console.info('🐺 Creating base dir') // eslint-disable-line no-console
  await ipfs.files.mkdir(config.ipfs.prefix)

  return findBaseDir(config, ipfs)
}

module.exports = findBaseDir
