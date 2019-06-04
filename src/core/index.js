'use strict'

const update = require('./commands/update')
const proxy = require('./commands/proxy')

module.exports = (options) => {
  if (process.argv.slice(2)[0] === 'update-registry-index') {
    return update(options)
  }

  return proxy(options)
}
