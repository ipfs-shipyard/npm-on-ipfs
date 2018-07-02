'use strict'

var url = require('url')
var verify = require('./verify.js').verify
var path = require('path')
var async = require('async')

exports.check = (o, options, callback) => {
  if (!o.versions) {
    return callback()
  }
  var tarballs = []
  Object.keys(o.versions).forEach((version) => {
    var info = o.versions[version]
    if (info.dist && info.dist.tarball && info.dist.shasum) {
      var u = url.parse(info.dist.tarball)
      tarballs.push({
        path: u.pathname,
        tarball: path.join(u.pathname),
        shasum: info.dist.shasum
      })
    }
  })
  if (!tarballs.length) {
    return callback()
  }
  async.eachLimit(tarballs, options.limit, verify, function () {
    callback(null, tarballs)
  })
}
