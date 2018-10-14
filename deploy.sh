#!/bin/bash -eux

# Remove old images
docker rm $(docker ps -q -f 'status=exited') || echo 'Failed to remove old containers, maybe there was nothing to do'
docker rmi $(docker images -q -f "dangling=true") || echo 'Failed to remove old images, maybe there was nothing to do'

# Get the latest
git pull

# Build a Docker image
docker-compose build --no-cache replicate registry

# Shut down the registry containers
docker-compose stop replicate registry

# Restart using the new image
docker-compose up -d --no-deps --force-recreate --scale registry=5 replicate registry
