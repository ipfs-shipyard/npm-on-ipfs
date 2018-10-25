'use strict'

const IpfsApi = require('ipfs-api')
const ipfsdCtrl = require('ipfsd-ctl')
const which = require('which-promise')

const spawn = (args) => {
  return new Promise((resolve, reject) => {
    ipfsdCtrl
      .create(args)
      .spawn({
        init: true
      }, (error, node) => {
        if (error) {
          return reject(error)
        }

        resolve(node)
      })
  })
}

const startIpfs = async (config) => {
  if (config.ipfs.node === 'proc') {
    console.info('👿 Spawning an in-process IPFS node') // eslint-disable-line no-console

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
