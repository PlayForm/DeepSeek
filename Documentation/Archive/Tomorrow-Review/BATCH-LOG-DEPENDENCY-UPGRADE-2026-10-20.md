---
title: The Tomorrow Review - the dependency upgrade pass (2026-10-20)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-20
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-DEPENDENCY-UPGRADE-2026-10-20.md
index: Documentation/INDEX.md
statuses:
	- name: the dependency upgrade pass (the user's instruction)
		state: implemented
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - the DEPENDENCY UPGRADE PASS section; four moved, two blocked with reasons, both lockfiles reconciled
---

# THE DEPENDENCY UPGRADE PASS (2026-10-20)

> Granular topic document distilled from the master record's chronological batch log
> (Documentation/Plans/TOMORROW-REVIEW.md - the DEPENDENCY UPGRADE PASS section; the master record
> remains the authoritative source).

---

- **THE LANE** (`d57df824`, GLM flash high) is COMPLETE, with all gates green.

    The family's externals were almost entirely at latest already, and four moved:
    @deepseek-ai/cordis 4.0.4 -> 4.0.5 (all 30 packages), tsc-alias 1.9.7 -> 1.9.8 (all 30),
    @deepseek-ai/schemastery 3.18.4 -> 3.18.5 (the live-containers pair), and astro 7.4.0 -> 7.4.1
    (the Site).

- **BLOCKED + PINNED BACK WITH REASONS**: the @deepseek-ai/dsh-* 0.2.0-rc.2 -> 0.2.1-rc.2 (TS2589 in
  the factory's awaited tsc step, bisected) and the Site's tailwindcss 3.4.19 -> 4.3.3, because v4
  removes the tailwindcss/nesting export the PostCSS config uses.

- **THE PRESERVED PINS**: the intra-family 0.0.1 pins + the effect 4.0.5 pins preserved, because
  effect's latest IS 4.0.5 and no Versions.Effect change was needed.

- **THE ARBITERS**: the serialized build exit 0, "All 207 smoke suites passed", the site build of 24
  pages, the Drift 310/310, and the alias + the newline gates clean.

    Both lockfiles were reconciled: the stale legacy per-package node_modules shadowing cordis 4.0.4
    was removed, and the minimal layout was re-materialized via pnpm install --force.

- **THE USER COMMITTED MID-TASK**: 99891ef (the 30-package manifest alignment).

    The remaining delta is the regenerated ets-hook-dsh-ccr Config.d.ts (the family-canonical
    named-import declaration style, the one outlier) + the Site's disk-only changes, which are
    gitignored.

- **THE FOLLOW-UP (dispatched)**: migrate the 10 flavor prepublishOnly.sh scripts' legacy
  ./node_modules/.bin/tsc line to pnpm exec, drop the hand-made symlinks, and re-verify.

- **THE FOLLOW-UP COMPLETE (2026-10-20, `d57df824`)**: the 10 flavor prepublishOnly.sh scripts'
  third step migrated to `pnpm exec tsc -p Configuration/TypeScript-Test.noemit.json`, and the
  actual tsconfig name was kept, because the parent's message had said
  TypeScript-Script-Test.noemit.json while the lane kept the real argument.

    The family-canonical NOTE comments were added, and all 10 hand-made .bin/tsc symlinks were
    dropped.

    Verified: the 10 packages' prepublishOnly serialized exit 0, "All 207 smoke suites passed", and
    the alias guard is clean.

    The git delta: the 10 scripts + the previously-reported ets-hook-dsh-ccr Config.d.ts, awaiting
    commit.

    Suggested message: "chore(dsh-hooks): Finish the prepublishOnly tsc-runner migration - the ten
    normalize flavors' third step moves from ./node_modules/.bin/tsc to pnpm exec".

- **THE LIVE NOTE**: the upgrade's rebuilds do NOT affect the RUNNING process, because the modules
  loaded at the restart.

    The upgraded Targets apply at the NEXT restart, and the user's live task tests the current
    family.
