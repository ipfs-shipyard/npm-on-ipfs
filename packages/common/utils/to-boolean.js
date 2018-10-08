'use strict'

const toBoolean = (value) => {
  if (value === undefined) {
    return undefined
  }

  if (value === 'false' || value === '0' || value === 'no') {
    return false
  }

  if (value === 'true' || value === '1' || value === 'yes') {
    return true
  }

  return Boolean(value)
}

module.exports = toBoolean
