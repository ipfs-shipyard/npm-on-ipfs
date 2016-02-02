var config = require('./config')

module.exports = (callback) => {
  config.apiCtl.files.ls('/npm-registry', callback)
}
