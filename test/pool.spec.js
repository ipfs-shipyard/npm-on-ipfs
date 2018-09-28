/* eslint-env mocha */
'use strict'

const expect = require('chai')
  .use(require('dirty-chai'))
  .expect
const createPool = require('../src/core/utils/create-pool')
const delay = require('promise-delay')

describe('pool', () => {
  it('should not execute the same task twice', async () => {
    const pool = createPool(5)
    let invocations = 0

    const task = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          invocations = invocations + 1

          resolve()
        }, 100)
      })
    }
    task.id = 'something-unique'

    await Promise.all([
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task)
    ])

    expect(invocations).to.equal(1)
  })

  it('should not exceed the concurrency limit', async () => {
    const pool = createPool(5)
    let running = 0

    const task = () => {
      return new Promise((resolve) => {
        running = running + 1

        setTimeout(() => {
          running = running - 1

          resolve()
        }, 1000)
      })
    }

    Promise.all([
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task),
      pool.addTask(task)
    ])

    await delay(100)

    expect(running).to.equal(5)
  })
})
