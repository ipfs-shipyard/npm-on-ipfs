/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const timeoutPromise = require('../utils/timeout-promise')

describe('timeout-promise', () => {
  it('should time out', async () => {
    try {
      await timeoutPromise(new Promise((resolve, reject) => {}), 100)
      throw new Error('Expected timeoutPromise to throw')
    } catch (error) {
      expect(error.code).to.equal('ETIMEOUT')
    }
  })

  it('should not time out', async () => {
    const result = await timeoutPromise(new Promise((resolve, reject) => {
      resolve('ok')
    }), 1000)

    expect(result).to.equal('ok')
  })
})
