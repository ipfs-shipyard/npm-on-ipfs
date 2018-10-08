'use strict'

const sinon = require('sinon')

module.exports = () => {
  return {
    write: sinon.stub(),
    end: sinon.stub(),
    on: sinon.stub(),
    emit: sinon.stub(),
    removeListener: sinon.stub()
  }
}
