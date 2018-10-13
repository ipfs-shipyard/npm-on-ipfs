/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const toBoolean = require('../utils/to-boolean')

describe('to-boolean', () => {
  it('should convert things to boolean', async () => {
    expect(toBoolean('true')).to.be.true()
    expect(toBoolean('1')).to.be.true()
    expect(toBoolean('yes')).to.be.true()
    expect(toBoolean('ok')).to.be.true()
    expect(toBoolean(true)).to.be.true()
    expect(toBoolean(1)).to.be.true()

    expect(toBoolean('false')).to.be.false()
    expect(toBoolean('0')).to.be.false()
    expect(toBoolean('no')).to.be.false()
    expect(toBoolean(false)).to.be.false()
    expect(toBoolean(0)).to.be.false()
    expect(toBoolean(null)).to.be.false()

    expect(toBoolean(undefined)).to.be.undefined()
  })
})
