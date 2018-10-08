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
      const existingTask = queue.find(other => fn.id && fn.id === other.fn.id)

      if (existingTask) {
        return existingTask.promise
      }

      const task = {
        fn
      }
      queue.push(task)

      task.promise = new Promise((resolve, reject) => {
        task.resolve = resolve
        task.reject = reject

        setImmediate(() => maybeExecuteNext())
      })

      return task.promise
    }
  }
}
