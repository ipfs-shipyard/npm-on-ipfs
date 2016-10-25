'use strict'

const config = require('./config')
const api = config.apiCtl

module.exports = api.files.ls.bind(api.files, config.blobStore.baseDir)
