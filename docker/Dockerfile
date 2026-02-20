FROM oven/bun:1-debian@sha256:d48b40bf0106dc1e94462c7086fbf4e8aab97f0870db2c87a05ecf8765f964df AS base
RUN apt-get update && \
    apt-get install -y git python3 python3-pip pipx
# install uv, see https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:latest@sha256:4cac394b6b72846f8a85a7a0e577c6d61d4e17fe2ccee65d9451a8b3c9efb4ac /uv /uvx /bin/
