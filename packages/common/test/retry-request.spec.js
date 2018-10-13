/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')
const {
  PassThrough
} = require('stream')

describe('retry-request', () => {
  let retryRequest
  let request
  let requestPromise
  let config

  beforeEach(async () => {
    config = {
      request: {

      }
    }

    requestPromise = sinon.stub()
    request = sinon.stub()

    mock('request-promise', requestPromise)
    mock('request', request)

    retryRequest = mock.reRequire('../utils/retry-request')
  })

  afterEach(async () => {
    mock.stopAll()
  })

  it('should retry a request', async () => {
    const pkg = {
      name: `module-${hat()}`
    }

    requestPromise
      .onFirstCall()
      .rejects(new Error('404'))

    requestPromise
      .onSecondCall()
      .resolves(JSON.parse(JSON.stringify(pkg)))

    const result = await retryRequest({
      uri: 'something',
      json: true
    })

    expect(result).to.deep.equal(pkg)
  })

  it('should retry a streaming request', (done) => {
    const pkg = {
      name: `module-${hat()}`
    }

    request
      .onFirstCall()
      .callsFake(() => {
        const stream = new PassThrough()

        setTimeout(() => {
          stream.emit('error', new Error('404'))
        }, 100)

        return stream
      })

    request
      .onSecondCall()
      .callsFake(() => {
        const stream = new PassThrough()

        setTimeout(() => {
          stream.emit('data', 'hello')
          stream.end()
        }, 100)

        return stream
      })

    retryRequest({
      uri: 'something'
    })
      .then((stream) => {
        let result

        stream.on('data', (data) => {
          result = data.toString('utf8')
        })

        stream.on('end', () => {
          expect(result).to.equal('hello')

          done()
        })
      })
      .catch(error => {
        done(error)
      })
  })

  it('should retry a streaming request that fails load', (done) => {
    const pkg = {
      name: `module-${hat()}`
    }

    request
      .onFirstCall()
      .callsFake(() => {
        const stream = new PassThrough()

        setTimeout(() => {
          stream.emit('response', {
            statusCode: 400
          })
        }, 100)

        return stream
      })

    request
      .onSecondCall()
      .callsFake(() => {
        const stream = new PassThrough()

        setTimeout(() => {
          stream.emit('response', {
            statusCode: 200
          })
          stream.emit('data', 'hello')
          stream.end()
        }, 100)

        return stream
      })

    retryRequest({
      uri: 'something'
    })
      .then((stream) => {
        let result

        stream.on('data', (data) => {
          result = data.toString('utf8')
        })

        stream.on('end', () => {
          expect(result).to.equal('hello')

          done()
        })
      })
      .catch(error => {
        done(error)
      })
  })
})
