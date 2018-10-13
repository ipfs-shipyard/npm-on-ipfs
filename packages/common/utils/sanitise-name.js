'use strict'

const sanitiseName = (name) => {
  name = `${(name || '').trim()}`.replace(/^(\/)+/, '/')

  if (name.startsWith('/')) {
    name = name.substring(1)
  }

  if (name.startsWith('@')) {
    name = name.replace(/@/g, '%2f')
  }

  return name
}

module.exports = sanitiseName
