'use strict'

const IpfsApi = require('ipfs-api')
const ipfsdCtrl = require('ipfsd-ctl')
const which = require('which-promise')
const promisify = require('util').promisify

const spawn = (createArgs, spawnArgs = {init: true}) => {
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
    console.info(`👿 Spawning an in-process IPFS node using repo at ${config.ipfs.repo}`) // eslint-disable-line no-console

    const node = await spawn({
      type: 'proc',
      exec: require('ipfs')
    }, {
      disposable: false,
      repoPath: config.ipfs.repo
    })

    return new Promise(async (resolve, reject) => {
      try {
        const initalise = promisify(node.init.bind(node))
        const start = promisify(node.start.bind(node))

        if (!node.initialized) {
          await initalise()
        }

        await start()

        resolve(node)
      } catch (error) {
        reject(error)
      }
    })
  } else if (config.ipfs.node === 'disposable') {
    console.info('👿 Spawning an in-process disposable IPFS node') // eslint-disable-line no-console

    return spawn({
      type: 'proc',
      exec: require('ipfs')
    })
  } else if (config.ipfs.node === 'js') {
    console.info('👿 Spawning a js-IPFS node') // eslint-disable-line no-console

    return spawn({
      type: 'js',
      exec: await which('jsipfs')
    })
  } else if (config.ipfs.node === 'go') {
    console.info('👿 Spawning a go-IPFS node') // eslint-disable-line no-console

    return spawn({
      type: 'go',
      exec: await which('ipfs')
    })
  }

  console.info(`👿 Connecting to a remote IPFS node at ${config.ipfs.node}`) // eslint-disable-line no-console

  return {
    api: new IpfsApi(config.ipfs.node),
    stop: (cb) => cb()
  }
}

module.exports = startIpfs
