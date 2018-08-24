'use strict'

const {
  URL
} = require('url')

module.exports = (options) => {
  const url = new URL('http://foo.com')
  url.protocol = options.external.protocol || options.mirror.protocol
  url.host = options.external.host || options.mirror.host
  url.port = options.external.port || options.mirror.port

  const string = url.toString()

  // strip the trailing slash
  return string.substring(0, string.length - 1)
}
