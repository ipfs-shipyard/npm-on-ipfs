#!/bin/bash -eux

# Remove old images
docker rm $(docker ps -q -f 'status=exited')
docker rmi $(docker images -q -f "dangling=true")

# Get the latest
git pull

# Build a Docker image
docker-compose build --no-cache replicate registry_1 registry_2 registry_3 registry_4 registry_5

# Shut down the registry containers
docker-compose stop replicate registry_1 registry_2 registry_3 registry_4 registry_5

# Restart using the new image
docker-compose up -d --no-deps --force-recreate replicate registry_1 registry_2 registry_3 registry_4 registry_5
