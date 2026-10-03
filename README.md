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

## Placeholders

Text marked `[REQUIRES OWNER INPUT]` on the Privacy, Terms and Support pages is waiting for
the site owner. Canonical URLs, `og:url`/`og:image`, a favicon and app store links are left
as commented placeholders until the domain, assets and store listings exist.
