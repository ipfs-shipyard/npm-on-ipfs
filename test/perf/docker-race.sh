#!/usr/bin/env bash

# Compare the first install times of a module via npm and ipfs-npm.
# Using Docker here to ensure we are using fresh caches for each run.
#
# Usage:
#
#    ./docker-race.sh [npm module]
#
# NOTE: On first run this will create a local image called ipfs-npm, from the
# Dockerfile at the root of this project. To update it with the latest source,
# rebuild the image:
#
#    docker build -t ipfs-npm .
#
# or simply delete it and let the script re-build it
#
#    docker image rm ipfs-npm -f
#
MODULE=${1:-iim}
IMAGE=ipfs-npm

if $(docker image ls | grep -q $IMAGE)
then
  echo "found ipfs-npm Docker image"
else
  echo "building docker image for ipfs-npm, this will take a moment"
  docker build -t $IMAGE ../../
fi

echo ""
echo "---- ipfs-npm flavour ----"
time docker run $IMAGE ipfs-npm install -g $MODULE

echo ""
echo "---- npm flavour ----"
time docker run node:10.15.3 npm install -g $MODULE
