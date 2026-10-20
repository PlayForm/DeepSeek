# Build and Deploy

## The scripts

| Script              | Command                              | Use                        |
| ------------------- | ------------------------------------ | -------------------------- |
| `prepublishOnly`    | `astro build`                        | The build; the arbiter     |
| `Diagrams`          | `node Source/Content/Mermaid/Render.mjs` | Re-render the diagrams |
| `Drift`             | `node Scripts/Drift-Guard.mjs`       | Check the fallbacks against the repo |
| `Run`               | `astro dev --host`                   | Dev server; not in this lane |

## The config

`astro.config.ts`:

- `srcDir: "./Source"`, `publicDir: "./Public"`, `outDir: "./Target"`.
- `site`: `https://deepseek.playform.cloud` in a build, `localhost:9999`
  in development. Keep it in sync with `Links.Site`.
- `compressHTML: true`; prefetch on hover.
- Integrations: the service worker (production only), the sitemap, the
  critical-CSS inliner (Beasties with `pruneSource: false`), and the
  compressor.

The aliases (`@Component`, `@Layout`, `@Library`, `@Stylesheet`, ...) mirror
the tsconfig paths; a new top-level source folder needs both.

## The build

```sh
cd Site
pnpm prepublishOnly
```

Then verify the built output, not the source:

```sh
find Target -name "*.html" | wc -l
grep -r "the changed string" Target/
```

The build is the only verification surface. A source edit without a build
is an unverified claim.

## The diagrams

1. Edit the `.mmd` source.
2. `pnpm Diagrams`.
3. Check the rendered SVG: the label text, the containment, the wrapping.

The renderer's limits are in the SKILL.md: the wrap budget, the list
markers, the entity escapes, the no-break space law, and the containment
law.

## The drift guard

`pnpm Drift` re-derives the figures from the repo and compares them with
the fallbacks in `Content.ts` and the built pages. Run it after any
figure, version, or count changes.

## Deployment: Cloudflare Pages

- **Build command:** `pnpm run prepublishOnly`
- **Output directory:** `Target/`
- **Framework preset:** none (static).

`Public/_headers` carries the cache rules for the content-hashed
`_astro/` assets. `Public/404.html` is served automatically. Routes are
directory-style (`plugins/index.html`).

## The deploy checklist

- [ ] `pnpm prepublishOnly` exits zero.
- [ ] The page count matches the expected set.
- [ ] The changed strings are in `Target/`.
- [ ] `pnpm Drift` passes.
- [ ] The sitemap includes the new page.
- [ ] `robots.txt` points at the sitemap.
- [ ] The 404 lists the current nav.
- [ ] `_headers` still carries the security headers.

## The known gaps

- The documented `pnpm lychee` link check has no script in
  `Site/package.json`. Add the script or correct the document.
- `_headers` has cache, nosniff, and referrer rules but no CSP, frame
  protection, or permissions policy.
- `robots.txt` has no `Sitemap:` line.

These are recorded so the next deploy does not rediscover them.

## Failure modes

- **Deploying a stale `Target/`**: the build was not run.
- **A new page missing from the sitemap**: the integration needs the page
  to be reachable from the source.
- **A header change without a redeploy**: Pages applies `_headers` at
  deploy time.
- **A diagram edited without `pnpm Diagrams`**: the SVG is stale.
