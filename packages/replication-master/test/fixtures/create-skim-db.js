'use strict'

const {
  createTestServer
} = require('registry-mirror-common/test/fixtures/test-server')

const createSkimDb = async (registry) => {
  const updates = []
  let seq = 0

  const resources = {
    '/': JSON.stringify({
      db_name: 'registry',
      doc_count: 807004,
      doc_del_count: 77670,
      update_seq: seq,
      purge_seq: 0,
      compact_running: false,
      disk_size: 6156660994,
      other: {
        data_size: 19122199289
      },
      data_size: 5606706136,
      sizes: {
        file: 6156660994,
        active: 5606706136,
        external: 19122199289
      },
      instance_start_time: '1538675327980753',
      disk_format_version: 6,
      committed_update_seq: 6425135,
      compacted_seq: 6423134,
      uuid: '370e266567ec9d1242acc2612839d6a7'
    }),
    '/_changes': (request, response, next) => {
      try {
        while (updates.length) {
          const update = updates.shift()

          seq++

          response.write(JSON.stringify({
            id: update,
            seq
          }) + '\n')
        }
      } catch (error) {
        console.error(error) // eslint-disable-line no-console
      }

      response.end()
    }
  }

  let skimDb = await createTestServer(resources)

  skimDb.publish = (update, tarball) => {
    registry[`/${update.name}`] = JSON.stringify(update.json)

    if (tarball) {
      registry[tarball.path] = tarball.content
    }

    updates.push(update.name)
  }

  return skimDb
}

module.exports = createSkimDb
