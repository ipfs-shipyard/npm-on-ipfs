'use strict'

function option () {
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]

    if (arg !== undefined && arg !== null && arg.toString() !== 'NaN') {
      return arg
    }
  }
}

module.exports = option
