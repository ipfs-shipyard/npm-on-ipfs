'use strict'

const delay = require('promise-delay')

const timeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise(async (_, reject) => {
      await delay(ms)

      const error = new Error('Timed out')
      error.code = 'ETIMEOUT'

      reject(error)
    })
  ])
}

module.exports = timeout
