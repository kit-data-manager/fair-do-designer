FROM node:23-bookworm AS base
RUN apt-get update && \
    apt-get install -y python3 python3-pip pipx
# install uv, see https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
