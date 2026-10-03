# MATCHOS Website

The MATCHOS official website: a static site served by Cloudflare Workers Static Assets.

| URL        | File                  |
|------------|-----------------------|
| `/`        | `public/index.html`   |
| `/privacy` | `public/privacy.html` |
| `/terms`   | `public/terms.html`   |
| `/support` | `public/support.html` |
| other      | `public/404.html` (404 status) |

There is no build step, framework or Worker script. `wrangler.jsonc` points Wrangler at
`./public`; `html_handling: auto-trailing-slash` serves `privacy.html` at `/privacy`, and
`public/_headers` sets the security headers.

## Develop

```sh
npm install
npm run dev      # wrangler dev → http://localhost:8787
npm run check    # wrangler deploy --dry-run (validates config, uploads nothing)
```

## Deploy

Pushing to `main` deploys through the Cloudflare Workers Builds integration, which runs
`npx wrangler deploy` at the repository root. Do not commit API tokens or credentials.

## Legal pages

The Privacy Policy, Terms of Service and Support pages are final, published text with no
placeholders. `public/privacy.html` is generated from `docs/privacy-policy-final-draft.md` in
the app repository; keep the two identical. Internal drafting notes for the Terms (sources and
open owner decisions) are in `docs/terms-legal-notes.md`, which is not deployed.
`og:image` and app store links stay out until those assets and store listings exist.
