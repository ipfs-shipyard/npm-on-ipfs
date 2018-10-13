/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const getExternalUrl = require('../utils/get-external-url')

describe('get-external-url', () => {
  it('should use external url from config', async () => {
    const config = {
      external: {
        protocol: 'http',
        host: 'external-host',
        port: 8080
      }
    }

    const result = getExternalUrl(config)

    expect(result).to.equal('http://external-host:8080')
  })

  it('should omit common ports', async () => {
    const config = {
      external: {
        protocol: 'http',
        host: 'external-host',
        port: 80
      }
    }

    const result = getExternalUrl(config)

    expect(result).to.equal('http://external-host')
  })

  it('should use internal url from config if external is not configured', async () => {
    const config = {
      http: {
        protocol: 'http',
        host: 'internal-host',
        port: 8080
      }
    }

    const result = getExternalUrl(config)

    expect(result).to.equal('http://internal-host:8080')
  })

  it('should use prefer external configuration', async () => {
    const config = {
      http: {
        protocol: 'http',
        host: 'internal-host',
        port: 8080
      },
      external: {
        protocol: 'http',
        host: 'external-host',
        port: 8080
      }
    }

    const result = getExternalUrl(config)

    expect(result).to.equal('http://external-host:8080')
  })
})
