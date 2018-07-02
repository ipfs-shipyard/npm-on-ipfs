#! /usr/bin/env node

'use strict'

var ronin = require('ronin')

var cli = ronin(__dirname)

cli.run()

// cli.autoupdate(function () {
//  cli.run()
// })
