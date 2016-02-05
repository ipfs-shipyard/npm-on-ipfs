const config = require('../config')
const log = config.log

module.exports = () => {
  var hooks = require('./hooks')

  hooks.startup({}, () => { }, () => {
    require('./clone').start()
    log('cloning NPM from https://registry.npmjs.org')
  })
}
