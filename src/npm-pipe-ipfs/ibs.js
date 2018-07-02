'use strict'

const config = require('../config')
const ipfsBlobStore = require('ipfs-blob-store')

module.exports = ipfsBlobStore(config.blobStore)
