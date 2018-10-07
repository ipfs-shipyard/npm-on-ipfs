'use strict'

const request = require('../utils/retry-request')

const master = async (options, ipfs, emitter) => {
  let ourId = (await ipfs.id()).id
  let ipnsName
  let baseDir

  const handlers = {
    root: () => {
      if (!baseDir) {
        return
      }

      ipfs.pubsub.publish(options.clone.pubsub.topic, Buffer.from(JSON.stringify({
        type: 'root',
        root: baseDir
      })), (error) => {
        if (error) {
          return console.error(`💥 Error publishing root to topic '${options.clone.pubsub.topic}'`, error)
        }

        console.info(`📰 Broadcast base dir response`)
      })
    }
  }

  emitter.on('processed', async (pkg) => {
    const parts = options.store.baseDir.split('/')
    const name = parts.pop()
    const rest = `/${parts.join('/')}`

    baseDir = (await ipfs.files.ls(rest, {
      long: true
    }))
      .filter(item => item.name === name)
      .pop()
      .hash

    console.info(`🗞️ Publishing IPNS update, base dir is /ipfs/${baseDir}`)

    ipfs.name.publish(`/ipfs/${baseDir}`, (error, res) => {
      if (error) {
        console.error(`💥 Error publishing IPNS name - ${error}`)

        return
      }

      console.info(`📰 Published IPNS update`)

      ipnsName = res.name
    })

    ipfs.pubsub.publish(options.clone.pubsub.topic, Buffer.from(JSON.stringify({
      type: 'update',
      manifest: pkg
    })), (error) => {
      if (error) {
        return console.error(`💥 Error publishing to topic '${options.clone.pubsub.topic}'`, error)
      }

      console.info(`📰 Broadcast update of ${pkg.name} module`)
    })
  })

  await ipfs.pubsub.subscribe(options.clone.pubsub.topic, (event) => {
    if (event.from === ourId) {
      return
    }

    const message = JSON.parse(event.data.toString('utf8'))

    if (handlers[message.type]) {
      handlers[message.type](message)
    } else {
      console.info(`🙋 Unknown message type ${message.type}`)
    }
  })
}

module.exports = master
