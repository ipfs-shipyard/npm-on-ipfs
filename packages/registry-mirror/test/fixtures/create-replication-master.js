'use strict'

const hat = require('hat')
const {
  createTestServer
} = require('registry-mirror-common/test/fixtures/test-server')

const createReplicationMaster = async () => {
  const id = hat()
  const topic = `topic-${hat()}`

  let replicationMaster = await createTestServer({
    '/': JSON.stringify({
      ipfs: {
        id
      },
      // empty directory
      root: '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
      topic
    })
  })

  return replicationMaster
}

module.exports = createReplicationMaster
