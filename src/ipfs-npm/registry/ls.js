'use strict'

const config = require('../config')

module.exports = (api, callback) => {
  api.files.ls(config.blobStore.baseDir, callback)
}
