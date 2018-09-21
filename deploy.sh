#!/bin/bash -eux

# Get the latest
git pull

# Build a Docker image
docker-compose build --no-cache registry

# Shut down the registry containers
docker-compose stop registry

# Restart using the new image
docker-compose up -d --no-deps --force-recreate --scale registry=5 registry
