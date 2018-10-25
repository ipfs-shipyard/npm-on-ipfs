'use strict'

const pkg = require('../../../package.json')

module.exports = () => {
  return async (request, response, next) => {
    const info = {
      name: pkg.name,
      version: pkg.version
    }

    response.statusCode = 200
    response.setHeader('Content-type', 'application/json; charset=utf-8')
    response.send(JSON.stringify(info, null, request.query.format === undefined ? 0 : 2))
  }
}
