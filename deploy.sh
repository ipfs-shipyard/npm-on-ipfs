#!/bin/bash -eux

# Remove old images
docker rm $(docker ps -q -f 'status=exited')
docker rmi $(docker images -q -f "dangling=true")

# Get the latest
git pull

# Build a Docker image
docker-compose build --no-cache replicate registry

# Shut down the registry containers
docker-compose stop replicate registry

# Restart using the new image
docker-compose up -d --no-deps --force-recreate --scale registry=5 replicate registry
