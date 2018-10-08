/* eslint-env mocha */
'use strict'

const config = require('../src/core/config')
const expect = require('chai')
  .use(require('dirty-chai'))
  .expect

describe('config', () => {
  it('should respect config', () => {
    const result = config.option(undefined, undefined, 1)

    expect(result).to.equal(1)
  })

  it('should respect config with NaN', () => {
    const result = config.option(undefined, NaN, 1)

    expect(result).to.equal(1)
  })

  it('should coerce to boolean', () => {
    expect(config.toBoolean('true')).to.equal(true)
    expect(config.toBoolean('false')).to.equal(false)
    expect(config.toBoolean('1')).to.equal(true)
    expect(config.toBoolean('0')).to.equal(false)
    expect(config.toBoolean('yes')).to.equal(true)
    expect(config.toBoolean('no')).to.equal(false)
    expect(config.toBoolean(true)).to.equal(true)
    expect(config.toBoolean(false)).to.equal(false)
  })

  it('should not coerce undefined', () => {
    expect(config.toBoolean(undefined)).to.equal(undefined)
  })
})
