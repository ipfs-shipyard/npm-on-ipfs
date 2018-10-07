'use strict'

const request = require('../utils/retry-request')
const delay = require('promise-delay')

const worker = async (options, ipfs) => {
  // find out the id of the replication master
  const master = (await request(Object.assign({}, options.request, {
    uri: options.clone.pubsub.master,
    json: true
  }))).ipfs.id

  let gotRoot

  // handle various pubsub messages
  const handlers = {
    update: (message) => {

    },
    root: (message) => {
      if (!message.root) {
        return
      }

      gotRoot = true
      console.info('baseDir is', message.root)

      ipfs.files.mv(`/ipfs/${message.root}`, options.store.baseDir)
    }
  }

  // subscribe to the registry-mirror pubsub topic
  await ipfs.pubsub.subscribe(options.clone.pubsub.topic, (event) => {
    if (event.from !== master) {
      return
    }

    const message = JSON.parse(event.data.toString('utf8'))

    if (handlers[message.type]) {
      handlers[message.type](message)
    } else {
      console.info(`🙋 Unknown message type ${message.type}`)
    }

    console.info('message', message)
  })

  // request the current registry base dir from the replication master
  for(let i = 0; i < 30; i++) {
    if (gotRoot) {
      break
    }

    ipfs.pubsub.publish(options.clone.pubsub.topic, Buffer.from(JSON.stringify({
      type: 'root'
    })), (error) => {
      if (error) {
        return console.error(`💥 Error publishing to topic '${options.clone.pubsub.topic}'`, error)
      }

      console.info(`📰 Broadcast base dir request`)
    })

    console.info(`⏳ Could not find root, waiting a bit`)
    await delay(1000)
  }

  if (!gotRoot) {
    console.info('🙍 Starting with empty registry')
  }
}

module.exports = worker
