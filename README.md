<p align="center">
  <img src="https://github.com/ipfs-shipyard/npm-on-ipfs/raw/master/img/npm-on-ipfs.jpg" alt="npm distributed on top of lots of connected IPFS nodes worldwide" />
</p>

# npm-on-IPFS

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://flat.badgen.net/travis/ipfs-shipyard/npm-on-ipfs)](https://travis-ci.com/ipfs-shipyard/npm-on-ipfs)
[![Code Coverage](https://codecov.io/gh/ipfs-shipyard/npm-on-ipfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs-shipyard/npm-on-ipfs)
[![Dependency Status](https://david-dm.org/ipfs-shipyard/npm-on-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs-shipyard/npm-on-ipfs)

**TLDR: npm-on-ipfs enables you to install your favourite modules from the distributed web using IPFS, as well as to have a cache always ready and shared on your local network — great for enterprise and community coding settings, or even just enabling more speedy work when you and your friends are working at a low-bandwidth coffee shop.**

## Quick background

As the largest software registry in the world, [npm](https://www.npmjs.com) is also the de facto package manager for the JavaScript ecosystem, with more than [900k](https://replicate.npmjs.com/_all_docs) packages and more than 7 billion downloads a week. It's incredibly fast and reliable — however, we couldn't stop ourselves from wondering what would happen if we put the world's largest registry on the distributed web.

The result is npm-on-ipfs: a module that wraps your package manager of choice (npm or yarn) in configuration to use [IPFS](https://ipfs.io/), not HTTP, to retrieve your dependencies from the central npm registry. It's still a work in progress, but we think you'll find it useful and awesome for the following reasons:

 - Having dependencies on the distributed web makes development **more available** because multiple nodes supplying tarballs means no panic if a single source goes dark
 - It can also be **faster and cheaper** — if dependencies are already being hosted on your local network, this means lower bandwidth cost and higher speed
 - If enough dependencies are hosted on your local network (think enterprise or community development settings), that network can operate **offline-first**: Take your team on a remote mountain retreat and hack away!

## Install & use

```console
$ npm i ipfs-npm -g
```

### Get started!

`ipfs-npm` wraps your favorite package manager (npm or yarn) with configuration that uses IPFS, rather than HTTP, to retrieve your dependencies from the central npm registry. Since it's intended to replace npm/yarn, all the commands you're used to will work in the same way.

For example: In the directory with your `package.json` file, run ...

```console
$ ipfs-npm install
👿 Spawning an in-process IPFS node
Swarm listening on /ip4/127.0.0.1/tcp/57029/ipfs/QmVDtTRCoYyYu5JFdtrtBMS4ekPn8f9NndymoHdWuuJ7N2
🗂️ Loading registry index from https://registry.js.ipfs.io
☎️ Dialling registry mirror /ip4/35.178.192.119/tcp/10015/ipfs/QmWBaYSnmgZi6F6D69JuZGhyL8rm6pt8GX5r7Atc6Gd7vR,/dns4/registry.js.ipfs.io/tcp/10015/ipfs/QmWBaYSnmgZi6F6D69JuZGhyL8rm6pt8GX5r7Atc6Gd7vR
🗑️ Replacing old registry index if it exists
📠 Copying registry index /ipfs/QmQmVsNFw3stJky7agrETeB9kZqkcvLSLRnFFMrhiR8zG1 to /npm-registry
👩‍🚀 Starting local proxy
🚀 Server running on port 57314
🎁 Installing dependencies with /Users/alex/.nvm/versions/node/v10.8.0/bin/npm
...
```

You can use any command you'd use with npm/yarn with ipfs-npm in exactly the same way:

```console
$ ipfs-npm install
$ ipfs-npm version minor
$ ipfs-npm publish
$ ipfs-npm --package-manager=yarn
// etc
```

## CLI guide

```console
$ ipfs-npm --help
ipfs-npm

Installs your js dependencies using IPFS

Options:
  --help                        Show help                              [boolean]
  --version                     Show version number                    [boolean]
  --package-manager             Which package manager to use - eg. npm or yarn
                                                                [default: "npm"]
  --ipfs-registry               Where to download any packages that haven't made
                                it into the registry index yet from
                                        [default: "https://registry.js.ipfs.io"]
  --registry-upload-size-limit  How large a file upload to allow when proxying
                                for the registry             [default: "1024MB"]
  --registry-update-interval    Only request the manifest for a given module
                                every so many ms                [default: 60000]
  --registry-connect-timeout    How long to wait while dialling the mirror
                                before timing out                [default: 5000]
  --registry-read-timeout       How long to wait for individual packages before
                                timing out                       [default: 5000]
  --ipfs-mfs-prefix             Which mfs prefix to use
                                                      [default: "/npm-registry"]
  --ipfs-disable-providers      Wether to disable the search for running nodes
                                                                [default: false]
  --ipfs-node                   "proc" to start an in-process IPFS node,
                                "disposable" to start an in-process disposable
                                node, "go" or "js" to spawn an IPFS node as a
                                separate process or a multiaddr that resolves to
                                a running node                 [default: "proc"]
  --ipfs-repo                   If --ipfs-node is set to "proc", this is the
                                path that contains the IPFS repo to use
                                                [default: "/Users/alex/.jsipfs"]
  --ipfs-flush                  Whether to flush the MFS cache   [default: true]
  --clone-pin                   Whether to pin cloned modules   [default: false]
  --request-max-sockets         How many concurrent http requests to make while
                                cloning the repo                   [default: 10]
  --request-retries             How many times to retry when downloading
                                manifests and tarballs from the registry
                                                                    [default: 5]
  --request-retry-delay         How long in ms to wait between retries
                                                                 [default: 1000]
  --request-timeout             How long in ms we should wait when requesting
                                files                           [default: 30000]
  --npm-registry                A fallback to use if the IPFS npm registry is
                                unavailable
                                         [default: "https://registry.npmjs.com"]
```

## Configuration files

ipfs-npm uses [`rc`](https://github.com/dominictarr/rc) to parse configuration files. Please see the [`rc` repository](https://github.com/dominictarr/rc#standards) for the order of precedence used when searching for configuration files. The app is `ipfs-npm`.

For instance, if you want to always use a remote daemon, you could create a `~/.ipfs-npmrc` file like this:

```json
{
  "ipfsNode": "/ip4/127.0.0.1/tcp/5001"
}
```

## To learn more

[Protocol Labs](https://protocol.ai), the organization behind IPFS, is actively working on improving the landscape for package managers and the distributed web in 2019 and beyond. To that end, we've created an [IPFS Package Managers Special Interest Group](https://github.com/ipfs/package-managers), and your feedback and contributions are very welcome!

If you're actively (or just casually) using npm-on-ipfs and have feedback about your user experience, we'd love to hear from you, too. Please open an issue in the [Special Interest Group](https://github.com/ipfs/package-managers) and we'll get right back to you.

More resources you may find useful:
- [The original npm-on-ipfs demo video](https://vimeo.com/147968322)
- [A more detailed introduction to npm-on-ipfs from David Dias' blog](http://daviddias.me/blog/stellar-module-management/)
- [Node.js Interactive talk on Stellar Module Management, aka npm-on-ipfs](https://www.youtube.com/watch?v=-S-Tc7Gl8FM)

## Lead maintainer

[Alex Potsides](https://github.com/achingbrain)
