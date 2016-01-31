var ipfsBlobStore = require('ipfs-blob-store')

module.exports = function (baseDir) {
  return ipfsBlobStore({
    baseDir: baseDir,
    flush: false
  })
}
