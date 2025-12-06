FROM oven/bun:1-debian@sha256:3da1c52799fc527af4c5969876734cbaddbf3e49479c601cfebdb0d7cbcc61b4 AS base
RUN apt-get update && \
    apt-get install -y git python3 python3-pip pipx
# install uv, see https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:latest@sha256:ae9ff79d095a61faf534a882ad6378e8159d2ce322691153d68d2afac7422840 /uv /uvx /bin/
