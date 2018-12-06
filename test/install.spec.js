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

  const runInstall = (args, callback) => {
    const installer = spawn(
      'nyc', [
        '--reporter=lcov',
        path.resolve(__dirname, '../src/cli/bin.js')
      ].concat(args), {
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
        return callback()
      }

      callback(new Error(`Unexpected exit code ${code}`))
    })
  }

  beforeEach(async () => {
    projectDirectory = path.join(os.tmpdir(), hat())

    await fs.mkdir(projectDirectory)
    await fs.copyFile(path.resolve(__dirname, './fixtures/package.json'), path.join(projectDirectory, 'package.json'))
  })

  it('should install a project with npm', (done) => {
    runInstall([
      '--ipfs-node=disposable',
      '--package-manager=npm',
      'install'
    ], done)
  })

  it('should install a project with yarn', (done) => {
    runInstall([
      '--ipfs-node=disposable',
      '--package-manager=yarn',
      'install'
    ], done)
  })

  it('should install a project using go-ipfs', (done) => {
    runInstall([
      '--ipfs-node=go',
      'install'
    ], done)
  })

  it('should install a project using js-ipfs', (done) => {
    runInstall([
      '--ipfs-node=js',
      'install'
    ], done)
  })
})
