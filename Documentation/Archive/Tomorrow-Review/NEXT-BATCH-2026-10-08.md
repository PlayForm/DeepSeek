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

> Granular topic document distilled from the master record Documentation/Plans/TOMORROW-REVIEW.md
> section 6 - byte-preserved; the master record remains the authoritative source.

---

1. **REMAINING-DIAGRAMS.**

    Cover the ~250 remaining [data-diagram] placeholders with the full diagram set via the
    established pipeline (the .mmd sources -> Render.mjs -> the vendored SVGs), applying the LR
    orientation, the full-width bands, the label-space law, and the byte-integrity.

    The proof set of 10 is done.

2. **ICON-MARGINS.**

    Fix the optical margins and spacing on the icons in the BrandIcon placements (the footer, the
    badges, the pills, the showcases), for consistent icon-to-text gaps, baseline alignment, and
    optical centering.

3. **DESIGN-PASS.**

    Do the overall better design pass (the rhythm, the section transitions, the hierarchy, the
    cohesion), plus the PARENT'S DESIGN SUGGESTIONS: the dark terminal-theme variant with a
    light/dark toggle (the shiki --shiki-dark bridge exists in the borrowed approach), the
    scroll-driven micro-interactions (the section reveals, the scroll progress on the case-study),
    the hero's engineering-grid background texture, and the stats band (12 packages / 733+746 checks
    / 0.0.1).

4. **SHOWCASE.**

    Showcase the functionality, with the workbench/matrix/index/plugin pages presenting what the
    family DOES, plus the PARENT'S SUGGESTION: a shared Compare component (the draggable
    before/after slider, raw vs normalized) and the terminal-chrome presentation of the stream
    surfaces.

5. **UPDATES.**

    Keep the current-state truthfulness across the site + the READMEs: the effect 4.0.2 declared vs
    installed, the publishConfigs, and the pending items' notes, so the docs never claim what is not
    live.

6. **PITFALLS.**

    Surface the lessons and known gaps (the load-order, the verifyCommand trap, the fixture paths,
    the ledger/live gaps) as the engineering pitfalls in the site + the READMEs.

7. **DUAL-SOURCE BUNDLING.**

    Publish the SAME npm target from the two sources: `@playform/dsh-hook-*` published once,
    carrying the Classic + the Effect-TS builds, so the user installs once and TOGGLES through the
    npm-native mechanism (the exports-map conditions or the package config, with no postinstall
    builds; the smokes verify both builds).

    The work is the design + the package-layout prep, NOT the publishing, which the npm agent does
    later.

    [SUPERSEDED 2026-10-09 by SPLICE-ETS.md: the one-name dual-build shape is replaced by the ets-*
    namespace split, so the two trees publish distinct names; this is a historical record, not
    rewritten.]

8. **COMPRESS-BORROW.**

    Adapt the .github (the Auto/NPM/Node/Dependabot workflows) and the other folders from
    ~/Developer/Application/PlayForm/Compress (the user's own repo) to the family's per-repo
    conventions, with no attribution.

9. **README/functionality completeness.**

    Fill the missing bits in the READMEs and the functional gaps: the install flows, the
    configuration, the troubleshooting, and the undocumented features.

10. **WEBSITE-ADOPTION.**

    Adopt the website we built, starting with the deployment/ops: the Cloudflare Pages DASHBOARD
    INTEGRATION deploys deepseek.playform.cloud automatically on push to Current.

    The wrangler/Cloudflare-deploy arm was RETRACTED per the user, so there is no workflow publish
    step, no deploy command, and no Cloudflare secrets; the freshness fix is simply committing +
    pushing Current.

    The _headers/404/robots/sitemap live, along with the monitoring, and the site goes live.
