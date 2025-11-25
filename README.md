This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
- `bun install && bun run build && bun run dev` to install dependencies and run the service. It is possible to use NPM if you prefer.

### Python setup

We use `uv`, which handles the setup properly if you execute a command.
For the commands, refer to `.github/workflows/build.yml`.
It includes a sync step which can normally be skipped, as it should be executed implicitly.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
