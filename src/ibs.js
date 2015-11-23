module.exports = function (baseDir) {
  var mfs = require('ipfs-blob-store')()
  // console.log('BASEDIR->', baseDir)
  mfs.baseDir = baseDir
  return mfs
}
