/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const sanitiseName = require('../utils/sanitise-name')

describe('sanitise-name', () => {
  it('should sanitise a package name', () => {
    expect(sanitiseName('hello')).to.equal('hello')
    expect(sanitiseName(' /@hello/blah  ')).to.equal('@hello%2fblah')
  })
})
