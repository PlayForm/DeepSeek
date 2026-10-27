# The Site Lane: Laws, Accuracy, and the Audit Lessons

## The laws

1. **The dev server.**

    No dev servers.

    The dev output is not the built output.

2. **The type check.**

    No `tsc` runs.

    The build type-checks.

3. **The git surface.**

    No git mutations.

    The site is its own repository; report READY-TO-COMMIT for `Site/` files.

4. **The verification.**

    The build is the verification: `cd Site && pnpm prepublishOnly`, then inspect `Site/Target/`.

5. **The content.**

    Documentation-first content: copy derives from the packages' real READMEs, schemes, and sources.

6. **The glyphs.**

    Byte-faithful glyphs use `raw-write`; the normalize hooks are active.

## The accuracy rules

A site claim is a promise to a reader.

The audit found four classes of broken promise; each rule below prevents one.

| Claim                   | Verify with                                         |
| ----------------------- | --------------------------------------------------- |
| Package count and names | `ls Classic/packages EffectTS/packages`             |
| Smoke totals            | the manifest line in each tree's `smokes/README.md` |
| Release version         | the package manifests                               |
| Model names             | `task-routing`'s catalog; `list_subagent_models`    |
| npm publication         | the registry, per package                           |
| A planned feature ships | `Documentation/Plans/` status                       |

The install snippet on a plugin page is the primary conversion path.

If the package is not on the registry, the snippet must say "build from source" or the page must
carry a "publish pending" marker.

A 404 on an install command is worse than no install command.

## The audit lessons

These are the concrete defects the audit found; they are the regression list for future site work.

1. **The false publication claim.** The plugins page said all fifteen packages were on npm; three of
   the newer ones returned 404. The setup page repeated it. Rule: verify the registry per package.
2. **The missing model.** The site named DeepSeek V4 Flash and GLM 5.3 Flash only; the catalog added
   `deepseek-v4.1-flash-1017` on 2026-10-20. Rule: model names come from the catalog.
3. **The stale README.** `Site/README.md` said twelve plugins and 21 pages; the site has fifteen
   detail pages and 25 built pages. Rule: the README is site content and is verified with the build.
4. **The half-stale 404.** The 404 listed five links and missed Setup, Workbench, Case Study, and
   the plugin index. Rule: the nav, the 404, and the sitemap share one page set.
5. **The missing nav entry.** `/matrix/` was reachable only from the footer while `/workbench/` was
   in the nav. Rule: every top-level page is either in the nav or deliberately footer-only,
   consistently.
6. **The un-runnable link check.** `lychee.toml` documented `pnpm lychee`, but `Site/package.json`
   had no such script. Rule: a documented command must exist.
7. **The thin headers.** `_headers` had cache rules, nosniff, and a referrer policy, but no CSP,
   frame protection, or permissions policy. Rule: a static site still ships security headers.
8. **The external font on the error page.** The 404 loaded Google Fonts while the rest of the site
   self-hosts. Rule: no external dependency on a page that must work when the network is degraded.
9. **The 113 KB stylesheet.** One `Global.css` ships to every page; the critical-CSS inliner does
   not prune. Rule: measure the CSS weight when adding page-specific blocks.

## The content rules

- Figures come from `Content.ts`; never hardcode one a page can read.
- A new figure gets a live reader in `Live.ts` plus a fallback, or is documented as fallback-only.
- Planned work is labeled planned, with a link to the plan. It is never presented as shipped.
- The site's prose is the family's public voice: precise, ASCII, no slogans that outrun the code.

## Failure modes

- **Dev-server reality**: a page verified against HMR output.
- **Source-only verification**: `Target/` stale, the claim false.
- **A promise without a registry check**: a 404 install path.
- **A page set drift**: nav, 404, and sitemap disagree.
