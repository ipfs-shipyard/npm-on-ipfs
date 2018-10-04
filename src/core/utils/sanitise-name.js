'use strict'

const sanitiseName = (name) => {
  name = `${(name || '').trim()}`.replace(/^(\/)+/, '/')

  if (name.startsWith('/')) {
    name = name.substring(1)
  }

  if (name.startsWith('@')) {
    name = name.replace(/%2f/g, '/')
  }

  return name
}

module.exports = sanitiseName
