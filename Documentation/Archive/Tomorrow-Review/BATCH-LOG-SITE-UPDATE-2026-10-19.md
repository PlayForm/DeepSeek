---
title: The Tomorrow Review - the site-update batch (the 2026-10-19/20 chronological log)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-SITE-UPDATE-2026-10-19.md
index: Documentation/INDEX.md
statuses:
	- name: the site update (the user-mandated queue addition)
		state: implemented
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - the queue addition, the SITE-B/A/C lanes, the site-fix pass; 24 pages, the build green, the Drift 310/310
---

# THE SITE-UPDATE BATCH (THE 2026-10-19/20 CHRONOLOGICAL LOG)

> Granular topic document distilled from the master record's chronological batch log
> (Documentation/Plans/TOMORROW-REVIEW.md - the dated sections from QUEUE ADDITION (2026-10-19)
> through THE PIPELINE COMPLETE (2026-10-20); the master record remains the authoritative source).
> The per-topic view for the site update: the queue addition, the blueprint, the SITE-B/A/C lanes,
> the site-fix pass.

---

## 1. The queue addition (2026-10-19 - user-mandated, NOT yet implemented)

- Full spec: `Documentation/Archive/Site/SITE-UPDATE-NOTE.md`.

- THE SUMMARY: (1) reflect ALL new functionality on the site + update the plugin READMEs, covering
  the CCR hook, the granular scopes + live volatile toggles, the overpass mechanism, and the
  tool-coach guardian.

- (2) Homepage: under the "Pinned manifests, deterministically" + "Governed pins, silently" boxes
  (Site/Source/pages/index.astro:331,341), add "supports: Cargo.toml, package.json" texts rendered
  as clickable buttons that display the use cases.

- (3) Weave the new functionality into ALL site descriptions + pages.

- (4) A dedicated, interactive homepage section for the tool-coach plugin in coachy colors
  (red/orange) with a distinct structure.

- (5) A separate tool-coach page under Site/Source/pages/plugins/ like the other plugins have.

- THE GATE: implement after the smoke-suite restructure settles.

## 2. The site-update blueprint (2026-10-19 - the wave-1 explorer)

- `19ffb358` COMPLETE -> `Documentation/Archive/Site/SITE-UPDATE-BLUEPRINT.md` (767 lines).

    The inventory: 21 pages mapped (THE PIN Showcase index.astro:328-337, THE GOVERN 338-347; the
    Showcase has no bottom slot, so the blueprint adds a slot="supports" line).

    It also holds the supports-button use-case copy extracted from the real READMEs (pinner =
    package.json only, pure P pass; governor = package.json chain canonicalize + detached ncu +
    Cargo.toml via the cargo sibling), the coachy colors ALREADY in the tokens (--color-pin-red
    #c62828, --color-accent-orange #bf3003, no new hex), the two-column "coaching board" section
    design (tier ladder + an interactive bash-call judge demo), and the DRIFT FLAG confirmed: the
    Classic tool-coach README is a byte-copy of the ETS twin (wrong H1), a fix item for the README
    lane.

    It also fixes the lane split B (Content.ts + sweep pages) -> A (index + SupportsButton + the 2
    new plugin pages, 21->23 pages) -> C (READMEs), plus the verification protocol (cd Site && pnpm
    prepublishOnly + pnpm Drift + the built-Target greps; never the dev server).

## 3. The site lanes (2026-10-19/20 - the overnight run)

- THE SITE-LANE DISPATCH PREP (mechanical, per the E2 blueprint).

    SITE-B is the data layer: Content.ts Counts.Packages 12->14 + Groups.Guardians + the
    Configurator roster + the suite-count surfaces + the description sweep across
    matrix/flavors/versions/workbench/setup/models/case-study, with the build = cd Site && pnpm
    prepublishOnly + the built-Target greps, never the dev server/tsc/git, at GLM flash high.

    SITE-A is the homepage: the supports-buttons under the THE PIN/THE GOVERN Showcases (index.astro
    328-347) + the slot="supports" Showcase line + the coachy tool-coach section (the
    --color-pin-red/--color-accent-orange tokens + the two-column coaching board) + the two new
    plugin pages (plugins/hook-dsh-ccr.astro + plugins/hook-dsh-tool-coach.astro mirroring the
    governor page template) + the 21->23 sweep, at GLM flash high.

    SITE-C is the READMEs: the new-functionality sections + the tool-coach Classic README H1 drift
    fix + the granularity story from the blueprint's THE GRANULARITY STORY section, at GLM flash
    low.

    The pair order: SITE-B first, because its slot pairs with I8 and the surfaces are disjoint, then
    SITE-A + SITE-C.

- SITE-B COMPLETE + VERIFIED (2026-10-19, `1b3e719d`): the data layer landed across 24 Site files,
  with Content.ts carrying Counts.CCR{146,146}/Coach{129,129} + Families + Groups.Guardians + the
  4.0.5 effect pin, Live.ts, the Configurator with the REAL ccr/coach patch bodies, the registry
  rows 13/14, the 7 normalize pages with the scopes/overpass sections + the four granularity facts,
  the setup/versions/case-study/flavors/matrix/workbench/models sweeps, and Base.astro JSON-LD.

    The build reported ZERO errors at 21 pages, because the 2 new pages are Site-A's, and the Drift
    guard passed all 262 content-layer checks.

    There were 34 pre-existing FAILs OUTSIDE the site surface: 5x the case-study JournalExcerpt
    lines whose corpus source the restructure removed + 29x the family Target-freshness from Sources
    touched without rebuilds, a wrap-up item where the family Targets need a serialized rebuild +
    re-verify, folded into I8's acceptance.

    One legit drift was fixed (the effect pin 4.0.2 -> 4.0.5), and the built-Target greps verified
    byte-exact (the 14-count surfaces, the 1008/1021 totals, the overpass lines, the marker + the
    gate formula, the guardians group).

    NOTE: pnpm prepublishOnly's script form aborts on the puppeteer build-script approval gate,
    where a one-time `pnpm approve-builds` unblocks it, and the build ran identically via
    ./node_modules/.bin/astro build.

    READY-TO-COMMIT: 24 Site files, and the user commits in the morning.

- SITE-A COMPLETE + VERIFIED (2026-10-19, `3b664fe6`): the homepage + the two new plugin pages
  landed with the build at ZERO errors and 23 pages + the sitemap regenerated.

    The built-Target greps verified the supports-buttons (the aria-expanded class-toggle chips + the
    hidden panels + the real expand content: "ONLY gate", "keep-list wins", "no ncu, no jobs, no
    subprocess", "surgical rewrites on the raw TOML lines"), the coachy section (the two-column
    coaching board + the tier ladder + the interactive judge demo with the strike accumulation + the
    enforce toggle + the CSS aliases --coach-red/--coach-orange over the EXISTING tokens, zero new
    hex), the fourteen sweep (9x fourteen, 0x twelve on the built index), the COMPRESS showcase with
    the terminal example + the 24-hex marker, and the byte-exact ledgers (the ccr activation + the
    coach's ten strings).

    The ccr page Injects were corrected to the REAL seam (pluginFactory, tools).

    NOTE: Site/ is GITIGNORED in this repo (.gitignore:32), so the site's change set is reported for
    the site's own versioning/deployment, following the site repo's auto-commit hook precedent.

    RESIDUALS: the case-study JournalExcerpt[1-5] quote fix (the byte source:
    Documentation/Handoff/Packages/Package-10.md:86-90, folded into Site-C), the ~29 plugin-Target
    staleness (folded into I8's acceptance), the Mermaid sources' "twelve" (the puppeteer Diagrams
    pipeline, deferred; the user's pnpm approve-builds unblocks it), and the ccr README's 48-hex
    marker example vs the sha256-24 store (a README-lane fix, folded into Site-C).

- SITE-C COMPLETE + VERIFIED (2026-10-20, `34bc7258`, GLM flash low): the README lane + the folded
  fixes landed with the Drift-Guard at 310/310 (the 5 JournalExcerpt failures GONE) and the astro
  build at 24 pages ZERO errors.

    The four granularity facts went into all 14 flavor READMEs (the per-call marker paragraph with
    "leave that search alone" + the two edges + the overpass invisibility contract), plus the
    effective-gate formula in both core READMEs, the volatile-refresh path in both factory READMEs,
    and the ccr overpass cross-reference.

    The folded fixes: the tool-coach Classic README H1 identity fix, the ccr 24-hex marker examples
    (both trees), and the case-study JournalExcerpt re-quoted byte-exact from the package READMEs'
    ledger samples, because Package-10.md is GONE and CASE-REVIEW.md has timestamps only.

    PLUS the parser fix, because the restructure's smokes-README format change crashed the
    Drift-Guard ParseSmokeReadme, which was updated to the "live as per-test folders" spelling.

    The READY-TO-COMMIT: 18 files (the 14 flavor READMEs + the core/factory/ccr/tool-coach READMEs +
    the three Site files).

    The RESIDUAL: the marker-not-taught FUTURE item stands, and I7 (the coach-grammar lane) owns it
    and fires after C2's docs settle.

## 4. The site-fix pass (2026-10-20 - the user's three reports, all fixed + verified)

- The user reported three problems on the dev server at :9999: (1) the supports help text placement,
  (2) the supports chips' dead clicks, and (3) the coachy section dead.

- THE ROOT CAUSES (both real bugs in the shipped site): (a) THE SUPPORTS PANELS, where the panel's
  `display:grid` class rule overrode the UA's `[hidden]` rule, so the hidden attribute was INERT and
  the panels were always visible while the click-to-expand toggled nothing visible.

    FIXED: the `[hidden]` override rule was added to the SupportsButton styles, built as
    `.supports__panel[data-astro-cid-mwh6yo7d][hidden]{display:none}`, where the (0,3,0) specificity
    wins (verified in the built CSS).

    (b) THE COACH DEMO, where the Judge() script read `data-coach-call` + `data-pattern` while the
    markup carries the kind in `data-call-kind` + the pattern in `data-call-pattern`, so a bare
    attribute returned "" and NO branch ever matched, the screen stayed empty, the strikes
    mis-counted, and the tier lights never lit.

    FIXED: the two getAttribute reads were aligned to the markup.

    (c) THE PLACEMENT, where the supports row is right-aligned (justify-content:flex-end) so the
    chips sit at the card's bottom right under the whole box, because the Showcase slot was already
    the closing row.

- REBUILT: 24 pages green.

- VERIFIED in the built output (the [hidden] rule + the flex-end row + the data-call-kind read) AND
  on the dev server, where the recompiled page carries all three fixes and the user needs a browser
  refresh.
