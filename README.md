registry-mirror
===============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [[![](https://img.shields.io/badge/freejs-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) ![Build Status](https://travis-ci.org/diasdavid/registry-mirror.svg?style=flat-square)](https://travis-ci.org/diasdavid/registry-mirror) ![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/diasdavid/registry-mirror.svg?style=flat-square)](https://david-dm.org/diasdavid/registry-mirror) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![Build Status](https://img.shields.io/travis/diasdavid/registry-mirror/master.svg?style=flat-square)](https://travis-ci.org/diasdavid/registry-mirror)

> Set up a NPM registry mirror, using your favourite storage, including IPFS! :D

# Usage

## Install

`npm i registry-mirror -g`

## CLI

```bash
$ registry-mirror
Usage: registry-mirror COMMAND [OPTIONS]

Available commands:

daemon  Mirror npm registry
```

## Commands

### daemon

`$ registry-mirror daemon`

Options:
- `--folder` - Name of the directory where the registry gets downloaded to
- `--blob-store` - Custom blob-store support (must follow [abstract-blob-store]() interface)
- `--clone` - Download the entire npm (Otherwise it just tries to read)
- `--ipfs` - Use local IPFS Node (must support the files/mfs API, available from version 0.4.0 onwards)
- `--port` Listen on the specified port
- `--host` Listen on the specified port

# Acknowledgements

This module takes a lot of inspiration from [reginabox](https://www.npmjs.com/package/reginabox). Big thank you to everyone that contributed with code or to the [discussion](https://github.com/ipfs/notes/issues/2) to make this happen.
