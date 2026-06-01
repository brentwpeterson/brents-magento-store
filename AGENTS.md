# AGENTS.md

Guidance for AI coding agents (Claude Code, etc.) working in this repo.

This is the **Magento AI Starter — Daffodil**: a Magento Open Source backend (at `magento/`) paired with a [Daffodil](https://github.com/graycoreio/daffodil) Angular storefront (at `daffodil/`), pre-wired for GitHub Codespaces. It is a learning / prototyping baseline, not a production store.

Users drive the project by typing natural-language requests at the `claude` prompt. The sections below map the requests in `README.md` to the exact commands you should run.

## Environment

- Working directory: `/workspace` (the repo root, containing `magento/` + `daffodil/`)
- Runtime: VS Code devcontainer (`.devcontainer/`) backed by the
  [`magento2-devcontainer`](https://github.com/graycoreio/magento2-devcontainer)
  submodule. Brings up MariaDB, Redis, OpenSearch, RabbitMQ, Mailpit,
  php-fpm, and nginx as sibling Docker services.
- Magento root is `/workspace/magento/`. Run `bin/magento` from there
  (or use `cd magento && bin/magento ...`).
- Daffodil workspace is `/workspace/daffodil/`. Run Angular commands
  from there.
- **Dependencies install automatically** on first `devcontainer up` —
  `updateContentCommand` runs `composer install` in `magento/` and
  `npm ci` in `daffodil/` in parallel. Both directories are
  gitignored, so a fresh Codespace clone is missing them until this
  step runs.
- **Magento is installed automatically** right after deps —
  `postCreateCommand` pipes
  `magento2-devcontainer/bin/setup-install.sh` to `bash`. The upstream
  script waits for sibling services (db/rabbitmq/opensearch) to
  accept TCP connections, auto-detects the monorepo layout (Magento
  at `magento/`), and picks up `$CODESPACE_NAME` to set a working
  `--base-url` in Codespaces.
- Backend (Magento) is exposed on the forwarded `nginx:8000` port.
- Storefront (Daffodil `ng serve`) is exposed on port `4200`.
- The Angular dev server's `proxy.conf.json` forwards `/graphql` to
  `http://nginx:8000` over the docker network. The storefront calls
  `/graphql` (relative), so the browser sees a single origin and no
  CORS configuration is needed.

## Common user requests

### "Start the Daffodil dev server" / "Show me the storefront"

```bash
cd daffodil
npx ng serve --host 0.0.0.0 --port 4200
```

This is a long-running command — leave it open. Codespaces forwards
`4200` automatically. The first compile takes ~30 seconds; subsequent
edits hot-reload.

### "Install Magento" / "Reinstall Magento"

Magento is already installed on first launch. If the user explicitly
asks to reinstall (or `setup:install` was interrupted), wipe the
partial state and re-run the upstream installer:

```bash
rm -f magento/app/etc/env.php magento/app/etc/config.php
.devcontainer/magento2-devcontainer/bin/setup-install.sh | bash
```

The upstream script prints the `bin/magento setup:install` command
with the devcontainer's default service hostnames, prepends a `cd
"./magento"` for the monorepo layout, and (in Codespaces) sets
`--base-url` to the forwarded `:8000` URL.

### "Add a banner to the homepage" / Frontend changes

Edit Angular components in `daffodil/src/app/`. The Daffodil schematic
laid out:

- `daffodil/src/app/daff/pages/home/home.component.ts` — homepage
- `daffodil/src/app/daff/pages/not-found/not-found.component.ts` — 404
- `daffodil/src/app/daff/product/components/product-list/` — listing
- `daffodil/src/app/daff/product/components/product-page/` — PDP
- `daffodil/src/app/daff/navigation/components/navigation.component.ts` — nav

The dev server hot-reloads on save — no command needed after editing.

For new components, use the Angular CLI:

```bash
cd daffodil
npx ng generate component features/<name>
```

### Backend (Magento) changes

- Run `bin/magento` from `/workspace/magento/`.
- After changes to `app/etc/config.php` or DI: `bin/magento setup:upgrade && bin/magento cache:clean`.
- After module changes: `bin/magento setup:upgrade && bin/magento cache:flush`.
- GraphQL schema lives under `magento/vendor/magento/module-*-graph-ql/etc/schema.graphqls`. Schema changes need `bin/magento cache:clean`.

### "Save a checkpoint" / "Save this"

Commit everything with a [Conventional Commits](https://www.conventionalcommits.org/) prefix. Pick the label from the nature of the change:

- `chore:` — setup, config, no user-visible change (no release bump)
- `docs:` — documentation only (no release bump)
- `fix:` — bug fix (patch bump)
- `feat:` — new user-visible feature (minor bump)

```bash
git add -A
git commit -m "<type>: <short description>"
```

`release-please` reads these labels and proposes versioned releases on push.

### "Save this and push it to GitHub"

Commit (as above) and then:

```bash
git push
```

## Conventions

- **Magento admin credentials** are dev defaults set by upstream
  `setup-install.sh`: `admin / admin123`. These are for the
  devcontainer only — never ship them.
- **Daffodil ↔ Magento wiring** lives in `daffodil/src/app/app.config.ts`.
  The `provideMagentoDriver({ uri: "/graphql" })` URI is intentionally
  relative — the proxy in `daffodil/proxy.conf.json` handles routing to
  the Magento backend. Don't switch this to an absolute URL.
- **CI**: `.github/workflows/check-store.yml` runs PHPUnit, the Magento
  coding standard, and a smoke test against `magento/` on every push
  and PR. Don't push backend changes that you haven't at least tried
  to build locally.
- **Dep refresh** — `composer.json` or `package.json` edits don't auto-
  re-install. After changes, run `composer install` in `magento/` or
  `npm install` in `daffodil/` manually. (Rebuilding the container
  also re-runs `updateContentCommand`.)

## Out of scope

This starter is explicitly **not production-ready**:

- Default admin password (`admin123`) is a known dev default.
- Magento ships with `Magento_TwoFactorAuth` enabled. Set up TOTP via
  the Mailpit-caught activation email on first admin login (see
  README step 6) — or `bin/magento module:disable
  Magento_TwoFactorAuth Magento_AdminAdobeImsTwoFactorAuth` if a
  user explicitly wants 2FA off for dev.
- Magento is in **default mode** out of the install (no DI compile,
  no static-content deploy). `bin/magento deploy:mode:set developer`
  if the user wants live template reloads / friendlier errors.
- No HTTPS — the storefront and admin both run over plain HTTP inside
  the devcontainer.
- The Angular dev server is `ng serve`, not a production build. The
  proxy approach for `/graphql` only works behind `ng serve`; for
  production, the storefront would be served as static files behind a
  reverse proxy (or with [`graycore/magento2-cors`](https://github.com/graycoreio/magento2-cors)
  configured to allow the storefront's origin).

If the user asks about taking this to production, flag the gap honestly
rather than papering over it.
