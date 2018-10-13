/* eslint-env mocha */
'use strict'

const mock = require('mock-require')
const sinon = require('sinon')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const server = require('../server')
const request = require('../utils/retry-request')

describe('server', function () {
  this.timeout(10000)

  it('should create a server', async () => {
    const config = {
      http: {

      },
      ipfs: {
        store: 'fs',
        fs: {

        }
      }
    }
    const s = await server(config)

    const result = await request({
      uri: `http://localhost:${config.http.port}/favicon.ico`
    })

    expect(result).to.be.ok()

    await s.stop()
  })
})
