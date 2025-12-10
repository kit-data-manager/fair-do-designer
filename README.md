# FAIR DO Designer

[Documentation](https://kit-data-manager.github.io/fair-do-designer/docs) | [Demo (preview / main branch)](https://kit-data-manager.github.io/fair-do-designer/)

The FAIR DO Designer is a fully client-side tool to create FAIR DOs. It offers a graphical user interface to build together your PID record designs, given examples of available metadata. This design can be applied repeatedly or in batch on the object you'd like to represent as a FAIR DO.

The current implementation allows exporting designs as python code for integration into existing applications, either directly or as a CLI tool.

## Setup and usage

> Note: You may have noticed a Dockerfile and a docker-compose.yml. Those are currently only meant for development purposes. They will not offer you a production-ready container. Please read this section if you want to build and set it up yourself. We may offer more convenient deployment methods later. Contributions regarding deployment setups (or other aspects) are highly welcome.

The tool can be self-hosted. We currently offer a [demo / preview on GitHub Pages](https://kit-data-manager.github.io/fair-do-designer/), which is always on the state of the main branch. The [pages workflow](.github/workflows/pages.yml) defines the deployment process, which should allow you to extract answers to more detailed questions. The short version is:

1. Install [bun](https://bun.sh/).
2. Optional: Set the path that will appear in the URL. E.g. `BASE_PATH=/fair-do-designer`
3. run `bun run build`.
4. Serve the `out` directory with any static HTTP server.

Python projects the FAIR DO Designer currently require `uv`. We plan to lower this barrier in future. In the meanwhile it is up to you to adjust the setup to your needs.

## Development

One way is to use the compose file to run a development container:

```bash
# with podman:
podman compose build
podman compose up -d
# or, if you prefer docker:
docker compose build
docker compose up -d
```

You can then use vscode to attach to the container.
The dev server is available at http://localhost:8080/fair-do-designer.
The container comes pre-installed with required tooling like bun and uv.

Otherwise, use these manual steps (install required tooling manually in beforehand):

- `pipx run pre-commit install` to enable all pre-commit hooks.
- `bun install && bun run build && bun run dev` to install dependencies and run the service. Avoid using NPM, so we can ensure buns lock file stays up-to-date.

### Python setup

We use `uv`, which handles the setup properly if you execute a command.
For the commands, refer to `.github/workflows/build.yml`.

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Interactive Next.js tutorial](https://nextjs.org/learn)
