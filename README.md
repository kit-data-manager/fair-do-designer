# FAIR DO Designer

Status: Starting early design prototype(s)

## Development

1. Start the dev container: `docker compose up -d`
    - The container will be created if required.
    - If you'd like to understand the setup, inspect the `docker-compose.yml` for details.
    - You'll get a shell in the container where you may run `npm run` commands documented in `package.json`.
    - Code/text editing can be done from the outside as usual.
    - Optional for advanced use cases: Get a shell into the dev container: `bash dev.sh` (will start the container, if required)
2. Go to http://localhost:8080
    - Port can be modified in `docker-compose.yml`, but the webpack dev server may need to be adjusted in order to make it work completely.

### Useful documentation

- Blockly
    - [A full list of pre-defined blocks can be found in the source code.](https://github.com/google/blockly/tree/develop/blocks)

## Findings

- Having the Profile on the right and the values on the left may be interesting to keep the left-to-right data flow. To do so, we can (ironically) set rtl to true for the workspace and then align all inputs to `"RIGHT"`. I will not do this now because it is additional work and not my current focus.
- Assigning complex data to the blocks is a bit hard/unsound from typescript. Therefore I currently split data from blocks to some degree and do not use one of the Blockly-given methods (extensions, mixins, mutators) with some pros and cons described in detail at `src/blocks/hmc_profile.ts`.

## Origin

This has been started using the [command from the Blockly documentation for a typescript setup](https://developers.google.com/blockly/guides/get-started/get-the-code): `npx @blockly/create-package app hello-world --typescript`
