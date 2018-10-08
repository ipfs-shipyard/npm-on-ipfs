'use strict'

const IPFS = require('ipfs')
const hat = require('hat')
const os = require('os')
const path = require('path')

module.exports = () => {
  return new Promise((resolve, reject) => {
    const ipfs = new IPFS({
      repo: path.join(os.tmpdir(), hat())
    })

    ipfs.once('ready', () => resolve(ipfs))
    ipfs.once('error', (error) => reject(error))
  })
}
