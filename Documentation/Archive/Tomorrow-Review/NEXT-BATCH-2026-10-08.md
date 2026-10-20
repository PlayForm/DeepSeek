---
title: The Tomorrow Review - the next batch (the 10 halted agents, 2026-10-08)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-08
status: complete
registry: Documentation/Archive/Tomorrow-Review/NEXT-BATCH-2026-10-08.md
index: Documentation/INDEX.md
statuses:
	- name: the next batch (the 10 halted agents for the site + the plugins, executed IN PAIRS)
		state: resolved
		evidence: this document; the master record Documentation/Plans/TOMORROW-REVIEW.md section 6
---

# THE NEXT BATCH (USER-INSTRUCTED 2026-10-08 - THE 10 HALTED AGENTS FOR THE SITE + THE PLUGINS, EXECUTED IN PAIRS, 2 AT A TIME)

> Granular topic document distilled from the master record
> Documentation/Plans/TOMORROW-REVIEW.md section 6 - byte-preserved; the
> master record remains the authoritative source.

---

1. **REMAINING-DIAGRAMS** - the ~250 remaining [data-diagram] placeholders -> the full diagram set via the established pipeline (the .mmd sources -> Render.mjs -> the vendored SVGs; the LR orientation, the full-width bands, the label-space law, the byte-integrity) - the proof set of 10 done.
2. **ICON-MARGINS** - the optical margins/spacing on the icons (the BrandIcon placements: the footer, the badges, the pills, the showcases) - the consistent icon-to-text gaps, the baseline alignment, the optical centering.
3. **DESIGN-PASS** - the overall better design pass (the rhythm, the section transitions, the hierarchy, the cohesion) + the PARENT'S DESIGN SUGGESTIONS: the dark terminal-theme variant (a light/dark toggle - the shiki --shiki-dark bridge exists in the borrowed approach), the scroll-driven micro-interactions (the section reveals, the scroll progress on the case-study), the hero's engineering-grid background texture, the stats band (12 packages / 733+746 checks / 0.0.1).
4. **SHOWCASE** - showcase the functionality (the workbench/matrix/index/plugin pages presenting what the family DOES) + the PARENT'S SUGGESTION: a shared Compare component (the draggable before/after slider - raw vs normalized) + the terminal-chrome presentation of the stream surfaces.
5. **UPDATES** - the current-state truthfulness across the site + the READMEs (the effect 4.0.2 declared vs installed, the publishConfigs, the pending items' notes - the docs never claim what is not live).
6. **PITFALLS** - the lessons/known-gaps surfaced (the load-order, the verifyCommand trap, the fixture paths, the ledger/live gaps - the engineering pitfalls in the site + the READMEs).
7. **DUAL-SOURCE BUNDLING** - the SAME npm target from the two sources: `@playform/dsh-hook-*` published once, carrying the Classic + the Effect-TS builds, the user installs once + TOGGLES (the npm-native mechanism - the exports-map conditions or the package config - no postinstall builds; the smokes verify both builds) - the design + the package-layout prep, NOT the publishing (the npm agent later). [SUPERSEDED 2026-10-09 by SPLICE-ETS.md: the one-name dual-build shape is replaced by the ets-* namespace split - the two trees publish distinct names; historical record, not rewritten.]
8. **COMPRESS-BORROW** - the .github (the Auto/NPM/Node/Dependabot workflows) + the other folders from ~/Developer/Application/PlayForm/Compress (the user's own repo) adapted to the family's per-repo conventions - no attribution.
9. **README/functionality completeness** - the missing bits in the READMEs + the functional gaps (the install flows, the configuration, the troubleshooting, the features undocumented).
10. **WEBSITE-ADOPTION** - adopt the website we built: the deployment/ops (the Cloudflare Pages DASHBOARD INTEGRATION deploys deepseek.playform.cloud automatically on push to Current - the wrangler/Cloudflare-deploy arm was RETRACTED per the user: no workflow publish step, no deploy command, no Cloudflare secrets; the freshness fix is simply committing + pushing Current; the _headers/404/robots/sitemap live, the monitoring) - taking the site live.
