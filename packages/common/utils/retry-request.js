'use strict'

const requestPromise = require('request-promise')
const request = require('request')
const {
  PassThrough
} = require('stream')

const makeRequest = (config) => {
  if (config.json) {
    return requestPromise(config)
  }

  // resolve with stream
  return new Promise((resolve, reject) => {
    const output = new PassThrough()

    const stream = request(config)
    stream.on('response', (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error(`${config.url} - ${response.statusCode}`))
      }
    })
    stream.on('error', (error) => {
      reject(error)
    })
    stream.once('data', (data) => {
      resolve(output)
    })
    stream.pipe(output)
  })
}

const retryRequest = (config, attempt = 1) => {
  const maxAttempts = config.retries || 1
  const delay = config.retryDelay || 0

  return makeRequest(config)
    .catch(error => {
      const method = (config.method || 'GET').toUpperCase()

      console.info(`🚨 Request to ${method} ${config.uri} failed on attempt ${attempt} - ${error}`)

      attempt += 1

      if (attempt > maxAttempts) {
        return Promise.reject(new Error(`Gave up requesting ${method} ${config.uri} after ${attempt} attempts`))
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          retryRequest(config, attempt)
            .then(resolve)
            .catch(reject)
        }, delay)
      })
    })
}

module.exports = retryRequest
