npm on IPFS
===========

![](/img/ip-npm-small.png)

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://ci.ipfs.team/buildStatus/icon?job=IPFS%20Shipyard/npm-on-ipfs/master)](https://ci.ipfs.team/job/IPFS%20Shipyard/job/npm-on-ipfs/job/master/)
[![Code Coverage](https://codecov.io/gh/ipfs-shipyard/npm-on-ipfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs-shipyard/npm-on-ipfs)
[![Dependency Status](https://david-dm.org/ipfs-shipyard/npm-on-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/npm-on-ipfs)

> Install your favourite modules from the Distributed Web using IPFS. Have a cache always ready and share them in all your local networks.

# Resources

- [The original demo video](https://vimeo.com/147968322)
- [Lengthy introduction in a blog post](http://daviddias.me/blog/stellar-module-management/)
- [Node.js Interactive Talk - Stellar Module Management](https://www.youtube.com/watch?v=-S-Tc7Gl8FM)

## Lead Maintainer

[Alex Potsides](https://github.com/achingbrain)

# Quick setup (probably all that you need)

## Install this module

```bash
> npm i ipfs-npm -g
```

# Usage

Wait for the `Server running` message:

```bash
$ docker run ipfs-npm
📦 Mirroring npm on localhost:50321
😈 Using in-process IPFS daemon
Swarm listening on /ip4/127.0.0.1/tcp/4003/ws/ipfs/Qm...
Swarm listening on /ip4/127.0.0.1/tcp/4002/ipfs/Qm...
Swarm listening on /ip4/172.17.0.2/tcp/4002/ipfs/Qm...
🚀 Server running
🔧 Please either update your npm config with 'npm config set registry http://localhost:50321'
🔧 or use the '--registry' flag, eg: 'npm install --registry=http://localhost:50321'
```

Port `50321` is default and can be set with `--port`.

## Configure npm

Set up your npm to use `ipfs-npm` with the default port through:

```bash
$ npm config set registry http://localhost:50321
```

If you picked another `--port` you need to adjust accordingly.

Good to npm install away! :)

# Usage

## CLI

```bash
$ ipfs-npm --help
ipfs-npm

Starts a registry server that uses IPFS to fetch js dependencies

Options:
  --help                    Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --clone                   Whether to clone the registry in the background
                                                                 [default: true]
  --eager-download          Whether to eagerly download tarballs [default: true]
  --mirror-host             Which host to listen to requests on
                                                          [default: "localhost"]
  --mirror-port             Which port to listen to requests on [default: 50321]
  --mirror-protocol         Which protocol to use with the server
                                                               [default: "http"]
  --mirror-registry         Where to download missing files from
                                         [default: "https://registry.npmjs.com"]
  --ipfs-port               Which port the daemon is listening on[default: null]
  --external-host           Which host to use when reaching this mirror
  --external-port           Which port to use when reaching this mirror
  --external-protocol       Which protocol to use when reaching this mirror
  --ipfs-host               Which host the daemon is listening on[default: null]
  --ipfs-base-dir           Which mfs prefix to use
                                                  [default: "/commons-registry"]
  --ipfs-flush              Whether to flush the MFS cache       [default: true]
  --ipfs-max-requests       How many concurrent requests to make to the IPFS
                            daemon                                  [default: 5]
  --ipfs-type               "proc" to start an in process node, "go" or "js" to
                            connect to a remote daemon (in conjunction with
                            --ipfs-port and --ipfs-host).      [default: "proc"]
  --clone-skim              Which registry to clone
                               [default: "https://replicate.npmjs.com/registry"]
  --clone-user-agent        What user agent to specify when contacting the
                            registry    [default: "IPFS registry-mirror worker"]
  --clone-delay             How long in ms to wait between cloning each module
                                                                    [default: 0]
  --clone-upgrade-to-https  If a tarball is specifed with an http URL, whether
                            to upgrade it to https               [default: true]
  --request-max-sockets     How many concurrent http requests to make while
                            cloning the repo                       [default: 10]
```

## Docker

```
$ docker-compose build
$ docker-compose up -d --scale registry=4
```

## Important

If you are on Mac OS X, make sure to increase the limit of files open (with `ulimit -Sn 4096`), otherwise the ipfs daemon will be sad and throw 502 replies.

# Acknowledgements

This module takes a lot of inspiration from [reginabox](https://www.npmjs.com/package/reginabox). Big thank you to everyone that contributed with code or to the [discussion](https://github.com/ipfs/notes/issues/2) to make this happen.
