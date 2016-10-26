'use strict'

module.exports = {
  command: 'registry',

  description: 'manipulate the registry',

  builder (yargs) {
    return yargs
      .commandDir('registry')
  },

  handler (argv) {}
}

