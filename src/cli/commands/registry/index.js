'use strict'

module.exports = {
  command: 'index',

  description: 'manipulate the registry index',

  builder (yargs) {
    return yargs
      .commandDir('index')
  },

  handler (argv) {}
}
