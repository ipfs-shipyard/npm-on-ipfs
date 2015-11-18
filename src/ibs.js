module.exports = function (baseDir) {
  var mfs = require('ipfs-blob-store')().mfs
  console.log('BASEDIR->', baseDir)
  mfs.baseDir = baseDir
  return mfs

  /*
  if (baseDir) {
    console.log('BASEDIR->', baseDir)
    mfs.baseDir = baseDir
    mfs.node.files.mkdir(mfs.baseDir, { p: true }, function (err) {
      if (err) {
        return console.error(err)
      }
    })
  }
  return mfs
  */
}
