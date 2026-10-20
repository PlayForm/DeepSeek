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

> Granular topic document distilled from the master record's chronological
> batch log (Documentation/Plans/TOMORROW-REVIEW.md - the DEPENDENCY
> UPGRADE PASS section; the master record remains the authoritative
> source).

---

- **THE LANE** (`d57df824`, GLM flash high) COMPLETE, all gates green:
  the family's externals were almost entirely at latest already; four
  moved - @deepseek-ai/cordis 4.0.4 -> 4.0.5 (all 30 packages),
  tsc-alias 1.9.7 -> 1.9.8 (all 30), @deepseek-ai/schemastery 3.18.4 ->
  3.18.5 (the live-containers pair), astro 7.4.0 -> 7.4.1 (the Site).
- **BLOCKED + PINNED BACK WITH REASONS**: the @deepseek-ai/dsh-*
  0.2.0-rc.2 -> 0.2.1-rc.2 (TS2589 in the factory's awaited tsc step -
  bisected), the Site's tailwindcss 3.4.19 -> 4.3.3 (v4 removes the
  tailwindcss/nesting export the PostCSS config uses).
- **THE PRESERVED PINS**: the intra-family 0.0.1 pins + the effect 4.0.5
  pins preserved (effect's latest IS 4.0.5 - no Versions.Effect change
  needed).
- **THE ARBITERS**: the serialized build exit 0, "All 207 smoke suites
  passed", the site build 24 pages, the Drift 310/310, the alias + the
  newline gates clean; both lockfiles reconciled (the stale legacy
  per-package node_modules shadowing cordis 4.0.4 removed + the minimal
  layout re-materialized via pnpm install --force).
- **THE USER COMMITTED MID-TASK**: 99891ef (the 30-package manifest
  alignment). Remaining delta: the regenerated ets-hook-dsh-ccr
  Config.d.ts (the family-canonical named-import declaration style - the
  one outlier) + the Site's disk-only changes (gitignored).
- **THE FOLLOW-UP (dispatched)**: the 10 flavor prepublishOnly.sh
  scripts' legacy ./node_modules/.bin/tsc line migrated to pnpm exec +
  the hand-made symlinks dropped + the re-verification.
- **THE FOLLOW-UP COMPLETE (2026-10-20, `d57df824`)**: the 10 flavor
  prepublishOnly.sh scripts' third step migrated to `pnpm exec tsc -p
  Configuration/TypeScript-Test.noemit.json` (the actual tsconfig name
  kept - the parent's message had said
  TypeScript-Script-Test.noemit.json, the lane kept the real argument) +
  the family-canonical NOTE comments + all 10 hand-made .bin/tsc
  symlinks dropped; verified: the 10 packages' prepublishOnly serialized
  exit 0, "All 207 smoke suites passed", the alias guard clean. The git
  delta: the 10 scripts + the previously-reported ets-hook-dsh-ccr
  Config.d.ts (awaiting commit). Suggested message: "chore(dsh-hooks):
  Finish the prepublishOnly tsc-runner migration - the ten normalize
  flavors' third step moves from ./node_modules/.bin/tsc to pnpm exec".
- **THE LIVE NOTE**: the upgrade's rebuilds do NOT affect the RUNNING
  process (the modules loaded at the restart). The upgraded Targets
  apply at the NEXT restart. The user's live task tests the current
  family.
