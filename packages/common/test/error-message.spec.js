/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const errorMessage = require('../utils/error-message')

describe('error-message', () => {
  it('should return an error message', async () => {
    const message = 'hello'

    expect(errorMessage(message)).to.contain(message)
  })
})
