'use strict'

module.exports = (concurrency) => {
  const queue = []
  let executing = 0

  const maybeExecuteNext = () => {
    if (executing === concurrency || !queue.length) {
      return
    }

    const task = queue.shift()

    executing++

    task.fn()
      .catch((error) => error)
      .then((result) => {
        executing--

        if (result instanceof Error) {
          task.reject(result)
        } else {
          task.resolve(result)
        }

        maybeExecuteNext()
      })
  }

  return {
    addTask: (fn) => {
      const task = {
        fn
      }

      queue.push(task)

      return new Promise((resolve, reject) => {
        task.resolve = resolve
        task.reject = reject

        maybeExecuteNext()
      })
    }
  }
}
