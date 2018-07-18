registry-mirror
===============

![](/img/ip-npm-small.png)

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Dependency Status](https://david-dm.org/diasdavid/registry-mirror.svg?style=flat-square)](https://david-dm.org/diasdavid/registry-mirror)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/coverage-76%25-yellow.svg?style=flat-square)

> registry-mirror sets a mirror the the whole NPM registry, using IPFS for the discovery and transport of modules.

# Resources

- [Demo video](https://vimeo.com/147968322)
- [Lengthy introduction in a blog post](http://daviddias.me/blog/stellar-module-management/)
- [Node.js Interactive Talk - Stellar Module Management](https://www.youtube.com/watch?v=-S-Tc7Gl8FM)

# Quick setup (probably all that you need)

## Install IPFS dev0.4.0

To install IPFS dev0.4.0, you will need go installed, to install go in your machine, go to https://golang.org/dl and then run:

```bash
$ go get -u github.com/ipfs/go-ipfs
$ ipfs version
ipfs version 0.4.0-dev
```

## Run IPFS daemon

```bash
$ ipfs daemon
Initializing daemon...
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/192.168.1.64/tcp/4001
Swarm listening on /ip4/192.168.10.172/tcp/4001
Swarm listening on /ip6/2001:8a0:7ac5:4201:4816:fd56:bea7:eaf3/tcp/4001
Swarm listening on /ip6/2001:8a0:7ac5:4201:ae87:a3ff:fe19:def1/tcp/4001
Swarm listening on /ip6/::1/tcp/4001
API server listening on /ip4/127.0.0.1/tcp/5001
Gateway (readonly) server listening on /ip4/127.0.0.1/tcp/8080
Daemon is ready
```

## Install registry-mirror

```bash
$ npm i registry-mirror -g
```

# Usage

Wait for the `Updated directory listing` log.

```bash
$ registry-mirror daemon
registry-mirror [info] using output directory /npm-registry/
registry-mirror [info] listening on 127.0.0.1:50321
registry-mirror [info] Cloning NPM OFF
registry-mirror [info] Updated directory listing, good to go :)
```

Port `50321` is default and can be set with `--port`.

## Configure npm

Set up your npm to use `registry-mirror` with the default port through:

```bash
$ npm config set registry http://localhost:50321
```

If you picked another `--port` you need to adjust accordingly.

Good to npm install away! :)

# Usage

## CLI

```bash
$ registry-mirror
Usage: registry-mirror COMMAND [OPTIONS]

Available commands:

daemon       Mirror npm registry
ls           Check modules available in the mirror
npm publish  Publish an IPNS record with your current npm list
npm update   Update your npm list of modules from IPNS
```

## Commands

### daemon

> starts the registry-mirror daemon

`$ registry-mirror daemon`

Options:
- `--clone` - Download the entire npm (Otherwise it just tries to read)
- `--port=<port>` Listen on the specified port
- `--host=<host>` Listen on the specified port

### ls

> lists all the modules available on the IPFS accessible registry and their respective hashes

`$ registry-mirror ls`

### npm update

> update your local registry cache

`$ registry npm update`

### npm publish

> publish the version of the cache you have from npm

`$ registry npm publish`

## Important

If you are on Mac OS X, make sure to increase the limit of files open (with `ulimit -Sn 4096`), otherwise the ipfs daemon will be sad and throw 502 replies.

# Acknowledgements

This module takes a lot of inspiration from [reginabox](https://www.npmjs.com/package/reginabox). Big thank you to everyone that contributed with code or to the [discussion](https://github.com/ipfs/notes/issues/2) to make this happen.
