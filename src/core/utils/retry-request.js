'use strict'

const requestPromise = require('request-promise')
const request = require('request')
const {
  PassThrough
} = require('stream')

const makeRequest = (options) => {
  if (options.json) {
    return requestPromise(options)
  }

  // resolve with stream
  return new Promise((resolve, reject) => {
    const output = new PassThrough()

    const stream = request(options)
    stream.on('response', (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error(`${options.url} - ${response.statusCode}`))
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

const retryRequest = (options, attempt = 1) => {
  const maxAttempts = options.retries || 1
  const delay = options.retryDelay || 0

  return makeRequest(options)
    .catch(error => {
      const method = (options.method || 'GET').toUpperCase()

      console.info(`🚨 Request to ${method} ${options.uri} failed on attempt ${attempt} - ${error}`)

      attempt += 1

      if (attempt > maxAttempts) {
        return Promise.reject(new Error(`Gave up requesting ${method} ${options.uri} after ${attempt} attempts`))
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          retryRequest(options, attempt)
            .then(resolve)
            .catch(reject)
        }, delay)
      })
    })
}

module.exports = retryRequest
