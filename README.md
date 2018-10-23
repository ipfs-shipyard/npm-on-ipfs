# npm on IPFS

<div align='center'>
  ![npm on IPFS logo](./img/npm-on-ipfs.svg)
</div>

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://ci.ipfs.team/buildStatus/icon?job=IPFS%20Shipyard/npm-on-ipfs/master)](https://ci.ipfs.team/job/IPFS%20Shipyard/job/npm-on-ipfs/job/master/)
[![Code Coverage](https://codecov.io/gh/ipfs-shipyard/npm-on-ipfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs-shipyard/npm-on-ipfs)
[![Dependency Status](https://david-dm.org/ipfs-shipyard/npm-on-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/npm-on-ipfs)

> Install your favourite modules from the Distributed Web using IPFS. Have a cache always ready and share them in all your local networks.

<div align='center'>
  ![npm distributed on top of lots of connected IPFS nodes worldwide](/img/ip-npm-small.png)
</div

## Resources

- [The original demo video](https://vimeo.com/147968322)
- [Lengthy introduction in a blog post](http://daviddias.me/blog/stellar-module-management/)
- [Node.js Interactive Talk - Stellar Module Management](https://www.youtube.com/watch?v=-S-Tc7Gl8FM)

## Lead Maintainer

[Alex Potsides](https://github.com/achingbrain)

## Install this module

```bash
> npm i ipfs-npm -g
```

# Usage

`ipfs-npm` wraps your chosen package manager (e.g. npm or yarn) with configuration to use IPFS to retrieve your dependences instead of over HTTP from the central npm registry.

In the directory with your `package.json` file, run:

```bash
$ ipfs-npm install
👿 Spawning an in-process IPFS node
🗑️ Replacing old registry index if it exists
☎️ Dialing replication master /ip4/127.0.0.1/tcp/40020/ipfs/QmeXyYCLSivUn5Ju31jjPBYNKdncbzzEf6zdN2DyrdLAbe
📠 Copying registry index /ipfs/QmQmVsNFw3stJky7agrETeB9kZqkcvLSLRnFFMrhiR8zG1 to /npm-registry
👩‍🚀 Starting local proxy
🚀 Server running on port 57314
🎁 Installing dependencies with /Users/alex/.nvm/versions/node/v10.8.0/bin/npm
...
```

## CLI

```bash
$ ipfs-npm --help
ipfs-npm

Installs your js dependencies using IPFS

Options:
  --help                        Show help                              [boolean]
  --version                     Show version number                    [boolean]
  --package-manager             Which package manager to use - eg. npm or yarn
                                                                [default: "npm"]
  --ipfs-registry-index         Where to download the registry index from if we
                                do not have it
                            [default: "https://replication.registry.js.ipfs.io"]
  --ipfs-registry               Where to download any packages that haven't made
                                it into the registry index yet from
                                        [default: "https://registry.js.ipfs.io"]
  --registry-upload-size-limit  How large a file upload to allow when proxying
                                for the registry             [default: "1024MB"]
  --registry-update-interval    Only request the manifest for a given module
                                every so many ms                [default: 60000]
  --ipfs-mfs-prefix             Which mfs prefix to use
                                                      [default: "/npm-registry"]
  --ipfs-node                   "proc" to start an in-process IPFS node, "go" or
                                "js" to spawn an IPFS node as a separate process
                                or a multiaddr that resolves to a running node
                                                               [default: "proc"]
  --request-max-sockets         How many concurrent http requests to make while
                                cloning the repo                   [default: 10]
  --request-retries             How many times to retry when downloading
                                manifests and tarballs from the registry
                                                                    [default: 5]
  --request-retry-delay         How long in ms to wait between retries
                                                                 [default: 1000]
  --request-timeout             How long in ms we should wait when requesting
                                files                           [default: 30000]
```

# Acknowledgements

This module takes a lot of inspiration from [reginabox](https://www.npmjs.com/package/reginabox). Big thank you to everyone that contributed with code or to the [discussion](https://github.com/ipfs/notes/issues/2) to make this happen.
