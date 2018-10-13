/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const hat = require('hat')
const replaceTarballUrls = require('../utils/replace-tarball-urls')

describe('replace-tarball-urls', () => {
  it('should replace tarball urls', async () => {
    const config = {
      external: {
        protocol: 'http',
        host: `localhost-${hat()}`,
        port: 80
      }
    }
    const pkg = {
      name: `module-${hat()}`,
      versions: {
        '1.0.0': {
          dist: {
            tarball: 'a-tarball'
          }
        }
      }
    }

    const result = replaceTarballUrls(config, JSON.parse(JSON.stringify(pkg)))

    expect(result.versions['1.0.0'].dist.source).to.equal(pkg.versions['1.0.0'].dist.tarball)
    expect(result.versions['1.0.0'].dist.tarball).to.equal(`${config.external.protocol}://${config.external.host}/${pkg.name}/-/${pkg.name}-1.0.0.tgz`)
  })
})
