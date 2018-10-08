#!/bin/bash -eux

# Remove old images
docker rm $(docker ps -q -f 'status=exited')
docker rmi $(docker images -q -f "dangling=true")

# Get the latest
# git pull

# Build a Docker image
docker-compose build --no-cache registry replicate

# Shut down the registry containers
docker-compose stop registry replicate

# Restart using the new image
# docker-compose up -d --no-deps --force-recreate --scale registry=5 --scale replicate=1 registry replicate

docker-compose up --no-deps --force-recreate registry replicate
