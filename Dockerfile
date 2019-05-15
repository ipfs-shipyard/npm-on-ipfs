# Build ipfs-npm from src. Used in test/perf/docker-race.sh
FROM node:10.15.3
MAINTAINER olizilla <oli@tableflip.io>

WORKDIR /opt/npm-on-ipfs

# Create a docker cache layer for just the deps. This means less rebuilding if
# only the source code changes
COPY package.json /opt/npm-on-ipfs
RUN npm install --quiet

# Copy the src dir to the image, and add `ipfs-npm` to the PATH.
COPY ./src /opt/npm-on-ipfs/src
RUN npm link
