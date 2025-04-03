# FAIR DO Designer

Status: Starting early design prototype(s)

## Development

1. Get a shell into the dev container: `bash dev.sh`
    - The container will be created if required.
    - If you'd like to understand the setup, inspect the `docker-compose.yml` for details.
    - You'll get a shell in the container where you may run `npm run` commands documented in `package.json`.
    - Code/text editing can be done from the outside as usual.
2. Go to http://localhost:3000
    - Port can be modified in `docker-compose.yml`.

## Origin

This has been started using the [command from the Blockly documentation for a typescript setup](https://developers.google.com/blockly/guides/get-started/get-the-code): `npx @blockly/create-package app hello-world --typescript`
