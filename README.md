npm on IPFS
===========

> previously known as `registry-mirror`

![](/img/ip-npm-small.png)

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Dependency Status](https://david-dm.org/diasdavid/registry-mirror.svg?style=flat-square)](https://david-dm.org/diasdavid/registry-mirror)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/coverage-76%25-yellow.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/diasdavid/registry-mirror/master.svg?style=flat-square)](https://travis-ci.org/diasdavid/registry-mirror)

> **Install your modules through IPFS!!** This CLI utility enables you to clone the npm registry into IPFS and/or mirror the registry from IPFS.

# Resources

- [Demo video](https://vimeo.com/147968322)
- [Lengthy introduction in a blog post](http://daviddias.me/blog/stellar-module-management/)
- [Node.js Interactive Talk - Stellar Module Management](https://www.youtube.com/watch?v=-S-Tc7Gl8FM)

# Installation

```bash
> npm install ipfs-npm --global
```

This will make the `ipfs-npm` CLI tool available globally and an alias, `ipnpm`. We will use the alias for examples and API documentation, as it is shorter.

# Usage

> **WIP**

### Examples

### API

#### `ipnpm registry` commands

##### `ipnpm registry clone` - Download and store the entire npm repository into IPFS

Downloads the entire npm registry from registry.npmjs.org and stores it on the IPFS node. 

This command will try to find an IPFS node on the default (`IPFS_PATH`), if none is found, it will start one.

**options:**
  - `seq-number` - Select the mirror sequence number to start from. Defaults to last, if none, 0.
  - `flush` - Write the modules to disk as soon as they are written into IPFS. Defaults to `true`
  - `ipfs` - Select an IPFS daemon by passing its API URL. e.g `ipnpm registry clone --ipfs=/ip4/127.0.0.1/tcp/5001`.
  - `log` - Sets the log level, default is `module`. Other options are: `[all, module]`. e.g `ipnpm registry clone --log=all`.

##### `ipnpm registry index publish` - Publishes the current index we know as an IPNS name

This command will try to find an IPFS node on the default (`IPFS_PATH`), if none is found, it will start one.

**options:**
  - `ipfs` - Select an IPFS daemon by passing its API URL. e.g `ipnpm registry clone --ipfs=/ip4/127.0.0.1/tcp/5001`.

##### `ipnpm registry index fetch` - Fetches the latest known index from the IPFS network

This command will try to find an IPFS node on the default (`IPFS_PATH`), if none is found, it will start one.

**options:**
  - `ipfs` - Select an IPFS daemon by passing its API URL. e.g `ipnpm registry clone --ipfs=/ip4/127.0.0.1/tcp/5001`.

#### `ipnpm daemon` - Starts an ipfs-npm daemon, so that we can point our npm cli to ithttps://www.youtube.com/watch?v=zGjj6Wg8SJA&feature=youtu.be

This command will try to find an IPFS node on the default (`IPFS_PATH`), if none is found, it will start one.

**options:**
  - `ipfs` - Select an IPFS daemon by passing its API URL. e.g `ipnpm registry clone --ipfs=/ip4/127.0.0.1/tcp/5001`.

#### `ipnpm install <module>` - Similar to `npm install`, however it tries first to download the module from npm and then falls back into the regular registry

This command will try to find an IPFS node on the default (`IPFS_PATH`), if none is found, it will start one.

**options:**
  - `ipfs` - Select an IPFS daemon by passing its API URL. e.g `ipnpm registry clone --ipfs=/ip4/127.0.0.1/tcp/5001`.

## Important: Getting 502 errors?

If you are on Mac OS X, make sure to increase the limit of files open (with `ulimit -Sn 4096`), otherwise the ipfs daemon will be sad and throw 502 replies.

# Acknowledgements

This module takes a lot of inspiration from [reginabox](https://www.npmjs.com/package/reginabox). Big thank you to everyone that contributed with code or to the [discussion](https://github.com/ipfs/notes/issues/2) to make this happen.
