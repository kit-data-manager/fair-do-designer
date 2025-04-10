# FAIR DO Designer

Status: Starting early design prototype(s)

## Development

1. Get a shell into the dev container: `bash dev.sh`
    - The container will be created if required.
    - If you'd like to understand the setup, inspect the `docker-compose.yml` for details.
    - You'll get a shell in the container where you may run `npm run` commands documented in `package.json`.
    - Code/text editing can be done from the outside as usual.
2. Go to http://localhost:8080
    - Port can be modified in `docker-compose.yml`, but the webpack dev server may need to be adjusted in order to make it work completely.

### Useful documentation

- Blockly
    - [A full list of pre-defined blocks can be found in the source code.](https://github.com/google/blockly/tree/develop/blocks)

## Findings

- Having the Profile on the right and the values on the left may be interesting to keep the left-to-right data flow. To do so, we can (ironically) set rtl to true for the workspace and then align all inputs to `"RIGHT"`. I will not do this now because it is additional work and not my current focus.

## Origin

This has been started using the [command from the Blockly documentation for a typescript setup](https://developers.google.com/blockly/guides/get-started/get-the-code): `npx @blockly/create-package app hello-world --typescript`
