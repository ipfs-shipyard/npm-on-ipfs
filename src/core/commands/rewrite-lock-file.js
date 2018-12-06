'use strict'

const {
  readFileSync,
  writeFileSync,
  existsSync
} = require('fs')
const path = require('path')
const URL = require('url').URL
const yarnLockfile = require('@yarnpkg/lockfile')

const replaceRegistryPath = (dependencies, registry) => {
  Object.keys(dependencies)
    .map(name => dependencies[name])
    .forEach(dependency => {
      if (dependency.resolved) {
        const url = new URL(dependency.resolved)

        url.protocol = registry.protocol
        url.host = registry.host
        url.port = registry.protocol === 'https:' ? 443 : 80

        dependency.resolved = url.toString()
      }

      replaceRegistryPath(dependency.dependencies || {}, registry)
    })
}

module.exports = async (options) => {
  if (options.packageManager === 'npm') {
    const lockfilePath = path.join(process.cwd(), 'package-lock.json')

    if (!existsSync(lockfilePath)) {
      console.info(`🤷 No package-lock.json found`) // eslint-disable-line no-console
      return
    }

    console.info(`🔏 Updating package-lock.json`) // eslint-disable-line no-console

    const lockfile = JSON.parse(readFileSync(lockfilePath, 'utf8'))

    replaceRegistryPath(lockfile.dependencies || {}, new URL(options.registry))

    writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2))
  } else if (options.packageManager === 'yarn') {
    const lockfilePath = path.join(process.cwd(), 'yarn.lock')

    if (!existsSync(lockfilePath)) {
      console.info(`🤷 No yarn.lock found`) // eslint-disable-line no-console
      return
    }

    console.info(`🔏 Updating yarn.lock`) // eslint-disable-line no-console

    const lockfile = yarnLockfile.parse(readFileSync(lockfilePath, 'utf8'))

    replaceRegistryPath(lockfile.object, new URL(options.registry))

    writeFileSync(lockfilePath, yarnLockfile.stringify(lockfile, null, 2))
  }
}
