/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const option = require('../utils/option')

describe('option', () => {
  it('should return the first non-undefined argument', () => {
    const result = option(null, 1, 2, 3)

    expect(result).to.equal(1)
  })

  it('should return false arguments', () => {
    const result = option(null, false, 2, 3)

    expect(result).to.equal(false)
  })
})
