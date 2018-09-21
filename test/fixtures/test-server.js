'use strict'

const http = require('http')

let testServers = []

module.exports = {
  createTestServer: (resources) => {
    return new Promise((resolve, reject) => {
      const server = http.createServer((request, response) => {
        if (resources[request.url]) {
          if (typeof resources[request.url] === 'function') {
            return resources[request.url](response)
          }

          response.statusCode = 200
          return response.end(resources[request.url])
        }

        response.statusCode = 404
        response.end('404')
      })

      server.listen((error) => {
        if (error) {
          return reject(error)
        }

        testServers.push(server)

        if (typeof resources === 'function') {
          resources = resources(server)
        }

        resolve(server)
      })
    })
  },

  destroyTestServers: () => {
    const servers = testServers
    testServers = []

    return Promise.all(
      servers.map((server) => {
        return new Promise((resolve) => {
          server.close(resolve)
        })
      })
    )
  }
}
