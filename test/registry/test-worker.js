'use strict'

process.on('message', (msg) => {
  switch (msg.cmd) {
    case 'ping':
      process.send({
        cmd: 'pong',
        data: msg.data
      })
      break
    default:
      throw new Error('unkown command')
  }
})
