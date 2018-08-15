'use strict'

module.exports = (func, ...args) => {
  return new Promise((resolve, reject) => {
    args.push((error, result) => {
      if (error) {
        return reject(error)
      }

      resolve(result)
    })

    func.apply(null, args)
  })
}
