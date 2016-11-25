/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const path = require('path')
const os = require('os')
const cluster = require('cluster')
const async = require('async')

const Workers = require('../../src/ipfs-npm/registry/clone/workers')

const testWorker = path.join(__dirname, 'test-worker.js')

describe.only('Workers', () => {
  describe('options', () => {
    it('throws on missing worker file', () => {
      expect(
        () => new Workers()
      ).to.throw(
        /missing worker file/
        )
    })

    it('sets default cpu count', () => {
      const workers = new Workers(testWorker)

      expect(workers).to.have.property('NUM_WORKERS', os.cpus().length)

      workers.kill()
    })
  })

  describe('sendAll', () => {
    it('sends a message to all workers', (done) => {
      const workers = new Workers(testWorker, 2)

      let count = 0
      workers.on('pong', (data) => {
        count++
        expect(data).to.be.eql(1)

        if (count === 2) {
          workers.kill()
          done()
        }
      })

      workers.sendAll('ping', 1)
    })
  })

  describe('sendNext', () => {
    it('sends messages in a round robin style', (done) => {
      const workers = new Workers(testWorker, 4)

      let counter = 0
      let ids = Object.keys(cluster.workers)
      expect(ids).to.have.length(4)

      const sendAndReceive = (cb) => {
        workers.once('pong', (data, id) => {
          expect(data).to.be.eql(counter)
          expect(id).to.be.eql(parseInt(ids[counter % ids.length], 10))
          counter++
          cb()
        })

        workers.sendNext('ping', counter)
      }

      async.whilst(
        () => counter < 50,
        (cb) => sendAndReceive(cb),
        (err) => {
          workers.kill()
          done(err)
        }
      )
    })
  })
})
