# Magento AI Starter — Daffodil

A starter for building on [Magento® Open Source](https://www.magento-opensource.com/)
with a [Daffodil](https://github.com/graycoreio/daffodil) Angular storefront,
pre-wired for [GitHub Codespaces](https://github.com/features/codespaces),
[GitHub Actions](https://github.com/features/actions), and
[Claude Code](https://claude.com/claude-code).

> **Starter kit, not a production store.** This is a learning and
> prototyping baseline. Going to production needs hosting, SSL,
> payments, performance tuning, and a security review. You can grow
> this into a real store — just not on day one.

---

## Quickstart

Click **Code → Codespaces → Create codespace on main**. The first
launch takes ~10 minutes — the devcontainer builds, all the Magento
services come up, `composer install` populates `magento/vendor/`,
`npm ci` populates `daffodil/node_modules/`, and `bin/magento
setup:install` runs against the now-warmed services. When the
terminal prompt returns, Magento is installed and the Daffodil
storefront is ready to serve.

### 1. Launch Claude

```bash
claude
```

This launches [Claude Code](https://claude.com/claude-code) inside the
Codespace — your terminal coding partner for the rest of this guide.

The first launch will print a one-time login link. Open it in your
browser, sign in to your Anthropic account, then paste the verification
code Claude shows you back into the terminal.

> **Prefer not to log in every time?** Add an
> [`ANTHROPIC_API_KEY`](https://console.anthropic.com/settings/keys)
> Codespaces secret. Claude picks it up from the environment automatically.

Everything below happens by typing requests at the `claude` prompt.

### 2. Start the Daffodil storefront

Ask Claude:

> Start the Daffodil dev server.

> **Prefer the manual command?**
>
> ```bash
> cd daffodil
> npx ng serve --host 0.0.0.0 --port 4200
> ```

### 3. View the storefront

Codespaces forwards port `4200` automatically. Click the **Open in
Browser** toast when it pops up, or open the **PORTS** tab and click
the globe icon next to `4200` to see the Daffodil storefront live.

The page you're looking at is the Angular dev server. Calls to
`/graphql` are forwarded through it to Magento (at `nginx:8000`) over
the devcontainer's docker network, so the storefront and the API look
like a single origin to the browser — no CORS configuration, no
environment-specific URLs.

### 4. Make a change with Claude

Still at the `claude` prompt, ask:

> Add a "Spring Sale" banner to the homepage.

Claude will pick the right Angular component, add the banner
markup with a small SCSS treatment, and the dev server hot-reloads.


Happy with it? Ask Claude to save and share:

> Save this and push it to GitHub.

Claude commits the change with a label that describes what just
happened, then uploads it so your team — and the automation in this
repo — can see it.

> **Prefer the manual version?**
>
> ```bash
> git add -A
> git commit -m "feat: add spring sale banner to homepage"
> git push
> ```
>
> The `feat:` / `fix:` / `chore:` prefix is
> [Conventional Commits](https://www.conventionalcommits.org/). This
> starter ships with
> [release-please](https://github.com/googleapis/release-please), which
> reads those labels and proposes a versioned release whenever you push.
> `feat:` triggers a minor bump; `fix:` a patch bump; `chore:` and
> `docs:` are no-ops.

### 5. Visit the Magento admin panel

The Daffodil dev server (port `4200`) is the customer-facing storefront.
The **admin panel** is where you manage products, content, and store
settings — it lives on the Magento backend (port `8000`).

In the **PORTS** tab, find the `8000` row and click the globe icon.
Append `/admin` to that URL and sign in with the devcontainer's default
credentials:

| Field    | Value                                   |
| -------- | --------------------------------------- |
| URL      | `<your-codespace-8000-url>/admin`       |
| Username | `admin`                                 |
| Password | `admin123`                              |

> **These are dev defaults, not production credentials.** They're set
> by the codespace so that you can get into the admin without ceremony. 

### 6. Set up two-factor auth via Mailpit

On your first admin login, Magento prompts you to set up two-factor
authentication and emails an activation link to the admin address. In
this starter, outbound mail never leaves the Codespace — it's caught
by [Mailpit](https://mailpit.axllent.org/) (running inside the
devcontainer) so you can develop without spamming a real inbox.

Codespaces forwards Mailpit's web UI on port `8025`. Open the
**PORTS** tab, find the `8025` row, and click the globe icon to open
the inbox.

Open the activation email from Magento and click the link inside. Pick
**Google Authenticator** (or any TOTP app you already use), scan the
QR code with your phone, and enter the 6-digit code. You're now signed
in to the admin.

> Mailpit also catches order confirmations, password resets, customer
> signups, and invoices — use it to design transactional emails
> without sending real mail.

### 7. View the CI pipeline

Open your repo's **Actions** tab — the `Check Store` workflow ran on
the push from step 4. That's the pre-fabricated CI this starter ships
with: every push and pull request runs PHPUnit, the Magento coding
standard, and a smoke test against the `magento/` directory. See the
[check-store docs](https://github.com/graycoreio/github-actions-magento2/blob/main/docs/workflows/check-store.md)
for what each check covers.

> Daffodil's storefront tests aren't wired into `check-store` yet —
> for now, run `npm test` inside `daffodil/` locally. A
> Daffodil-aware Angular CI workflow is on the roadmap.

---

## What's in here

- **`magento/`** — [Magento Open Source](https://www.magento-opensource.com/)
  (latest GA). Your headless commerce backend.
- **`daffodil/`** — a fresh [Angular](https://angular.dev/) workspace with
  [`@daffodil/commerce`](https://www.daff.io/)
  wired up to the
  [Magento driver](https://www.daff.io/docs/packages/driver/magento).
  Your storefront.
- **`.devcontainer/`** — a fullstack
  [devcontainer](https://github.com/graycoreio/magento2-devcontainer)
  for VS Code / [Codespaces](https://github.com/features/codespaces).
- **[Pre-fabricated CI](https://github.com/graycoreio/github-actions-magento2/blob/main/docs/workflows/check-store.md)** —
  `.github/workflows/check-store.yml` runs unit tests, coding standard,
  and a smoke test on every push and pull request.
- **[release-please](https://github.com/googleapis/release-please)** —
  cuts versioned releases from your conventional-commit history.
- **[Dependabot](https://docs.github.com/en/code-security/dependabot)** —
  keeps [composer](https://getcomposer.org/) and
  [GitHub Actions](https://github.com/features/actions) dependencies fresh.

---

Magento® is a registered trademark of Adobe Inc. This project is not
affiliated with or endorsed by Adobe.
