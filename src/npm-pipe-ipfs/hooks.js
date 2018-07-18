'use strict'

// hook for the several states of downloading an npm module

function hook (data, callback, success) {
  success()
}

exports.beforeAll = hook
exports.afterAll = hook
exports.tarball = hook
exports.afterTarball = hook
exports.versionJson = hook
exports.indexJson = hook
exports.globalIndexJson = hook
exports.startup = hook
exports.shasumCheck = hook
