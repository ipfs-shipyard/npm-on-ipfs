module.exports = function (baseDir) {
  var mfs = require('ipfs-blob-store')()
  mfs.baseDir = baseDir
  return mfs
}
