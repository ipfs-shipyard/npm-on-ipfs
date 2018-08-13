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

## Install this module

```bash
> npm i registry-mirror -g
```

# Usage

Wait for the `Server running` message:

```bash
$ docker run registry-mirror
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

Set up your npm to use `registry-mirror` with the default port through:

```bash
$ npm config set registry http://localhost:50321
```

If you picked another `--port` you need to adjust accordingly.

Good to npm install away! :)

# Usage

## CLI

```bash
$ registry-mirror --help
registry-mirror

Starts a registry server that uses IPFS to fetch js dependencies

Options:
  --help                    Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --clone                   Whether to clone the registry in the background
                                                                 [default: true]
  --download-tarballs       Whether to eagerly download tarballs [default: true]
  --mirror-host             Which host to listen to requests on
                                                          [default: "localhost"]
  --mirror-port             Which port to listen to requests on [default: 50321]
  --mirror-protocol         Which protocol to use with the server
                                                               [default: "http"]
  --mirror-registry         Where to download missing files from
                                         [default: "https://registry.npmjs.com"]
  --ipfs-port               Which port the daemon is listening on[default: null]
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
$ docker build . -t registry-mirror
$ docker run -p 50321:50321 registry-mirror
```

## Important

If you are on Mac OS X, make sure to increase the limit of files open (with `ulimit -Sn 4096`), otherwise the ipfs daemon will be sad and throw 502 replies.

# Acknowledgements

This module takes a lot of inspiration from [reginabox](https://www.npmjs.com/package/reginabox). Big thank you to everyone that contributed with code or to the [discussion](https://github.com/ipfs/notes/issues/2) to make this happen.
