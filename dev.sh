#!/usr/bin/env bash

set -e

if command -v docker >/dev/null 2>&1; then
    DOCKER=docker
elif command -v podman >/dev/null 2>&1; then
    DOCKER=podman
else
    echo "Error: Neither docker nor podman found"
    exit 1
fi

if [ ! -f "docker-compose.yml" ] && [ ! -f "compose.yaml" ]; then
    echo "Error: No compose file found"
    exit 1
fi

$DOCKER compose up -d && $DOCKER compose exec -it dev bash
