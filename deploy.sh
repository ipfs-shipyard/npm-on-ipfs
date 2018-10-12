#!/bin/bash -eux

# Remove old images
docker rm $(docker ps -q -f 'status=exited')
docker rmi $(docker images -q -f "dangling=true")

# Get the latest
git pull

# Build a Docker image
docker-compose build --no-cache replicate replicate_1 replicate_2 replicate_3 replicate_4 replicate_5

# Shut down the registry containers
docker-compose stop replicate replicate_1 replicate_2 replicate_3 replicate_4 replicate_5

# Restart using the new image
docker-compose up --no-deps --force-recreate replicate replicate_1 replicate_2 replicate_3 replicate_4 replicate_5
