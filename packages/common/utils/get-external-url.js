'use strict'

const {
  URL
} = require('url')

module.exports = (config) => {
  const url = new URL('http://foo.com')
  url.protocol = (config.external && config.external.protocol) || config.http.protocol
  url.host = (config.external && config.external.host) || config.http.host
  url.port = (config.external && config.external.port) || config.http.port

  const string = url.toString()

  // strip the trailing slash
  return string.substring(0, string.length - 1)
}
