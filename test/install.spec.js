/* eslint-env mocha */
'use strict'

const promisify = require('util').promisify
const fs = {
  mkdir: promisify(require('fs').mkdir),
  copyFile: promisify(require('fs').copyFile)
}
const path = require('path')
const os = require('os')
const hat = require('hat')
const {
  spawn
} = require('child_process')
const OutputBuffer = require('output-buffer')

describe('install', function () {
  this.timeout(30 * 60000)

  let projectDirectory

  before(async () => {
    projectDirectory = path.join(os.tmpdir(), hat())

    await fs.mkdir(projectDirectory)
    await fs.copyFile(path.resolve(__dirname, './fixtures/package.json'), path.join(projectDirectory, 'package.json'))
  })

  it('should install a project with npm', (done) => {
    const installer = spawn(
      process.argv[0], [
        path.resolve(__dirname, '../src/cli/bin.js'),
        '--ipfs-node=disposable',
        '--package-manager=npm',
        'install'
      ], {
        cwd: projectDirectory
      })

    const buffer = new OutputBuffer((line) => {
      console.info(line) // eslint-disable-line no-console
    })

    installer.stdout.on('data', (data) => {
      buffer.append(data.toString())
    })

    installer.stderr.on('data', (data) => {
      buffer.append(data.toString())
    })

    installer.on('close', async (code) => {
      buffer.flush()

      if (code === 0) {
        return done()
      }

      done(new Error(`Unexpected exit code ${code}`))
    })
  })

  it('should install a project with yarn', (done) => {
    const installer = spawn(
      process.argv[0], [
        path.resolve(__dirname, '../src/cli/bin.js'),
        '--ipfs-node=disposable',
        '--package-manager=yarn',
        'install'
      ], {
        cwd: projectDirectory
      })

    const buffer = new OutputBuffer((line) => {
      console.info(line) // eslint-disable-line no-console
    })

    installer.stdout.on('data', (data) => {
      buffer.append(data.toString())
    })

    installer.stderr.on('data', (data) => {
      buffer.append(data.toString())
    })

    installer.on('close', async (code) => {
      buffer.flush()

      if (code === 0) {
        return done()
      }

      done(new Error(`Unexpected exit code ${code}`))
    })
  })
})
