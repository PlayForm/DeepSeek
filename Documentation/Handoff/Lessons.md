# The Handoff — Working Lessons

> The working lessons accumulated across the family's sessions, collected in one place. The
> foundational agent protocols live in [`Packages/Package-05.md`](Packages/Package-05.md) ("The
> agent protocols — learned the hard way"); the session-by-session context lives in
> [`Packages/Package-01.md`](Packages/Package-01.md) … [`Packages/Package-13.md`](Packages/Package-13.md).

---

## Session 2026-10-04 late (Package 9)

- **The smoke-recovery pattern**: the /tmp smokes' full history lives in the session archives
  (write + edit tool calls) — replay them in record order (writes replace, edits apply) to
  reconstruct lost files; the "failed" edits in the ORIGINAL session also fail in the replay (they
  never changed the file). The file mtimes in `ls -la` are LOCAL time — the session records are UTC
  (the +3h offset reconciles them).
- **The pnpm-workspace trap**: `pnpm install` inside a bundle under
  `profiles/desktop/pnpm-workspace.yaml` acts on the WORKSPACE ROOT ("Already up to date") — a
  self-contained bundle needs its own `pnpm-workspace.yaml` (`packages: [.]`).
- **verbatimModuleSyntax type re-exports**: `export default` of an imported type is TS1284/TS1285 —
  the legal forms are `export type { … } from` (named) or an
  `export default interface X extends Imported {}` (a local interface default is elided). The core's
  named-only exports mean consumers import `{ Suppress }` etc. (a default import under
  esModuleInterop yields the module namespace — "not callable").
- **The build-order dependency**: a consumer's tsc type-checks against the FACTORY's built Target —
  rebuild the factory BEFORE consumer tsc after any factory Source change.

## Session 2026-10-05 (Package 12)

- The provider dies under parallel load (5 agents → most die in the reading phase); the recovery:
  on-disk edits persist, resume agents complete partial scopes; SERIALIZE the relaunches (1-2 at a
  time); embed the design facts in the spec (the agents reading each other's big session files is a
  death risk - extract the facts yourself).
- The user commits (never commit unless explicitly asked); the repo is theirs.
- The DSH docs live in the local deepseek-harness docs checkout (the installed packages
  are the tiebreaker for conventions).
- The harness tools reject unknown argument keys (`additionalProperties: false`) - any marker
  convention must be stripped before the tool validates.
- The plugins' own output streams are normalized (the system normalizes itself - cosmetic prose may
  come out hyphenated).

## Session 2026-10-06 (Package 13)

- **THE PATCH-LAYER SHADOWING (the saga's lesson)**: the bundle [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml) layers can shadow
  the schema defaults - the patch config REPLACES the entry config wholesale. Verify the LIVE
  effective config from the BUNDLE layers, never just the schema projection or the profile patch.
  The Config inspect provider projects the SCHEMA.
- **The cross-agent git-checkout hazard**: one agent's `git checkout` of "build-byproduct churn"
  clobbered another agent's in-flight README work (the "churn" was the other agent's writes - the
  build tool does NOT regenerate READMEs). Agents must never checkout files they did not modify;
  verify attributions before reverting.
- **The same-observed-version guard**: the chain passes all write with the triggering event's
  version - in a multi-step fold only the first write can succeed. The stat-before-write (the U₂
  pattern) is the general fix.
- **The smoke/live fidelity gap**: every real bug (the patch layers, the P5 v2 open, the version
  guard) was found LIVE, not by the smokes - the smokes prove the mechanics; the live battery proves
  the wiring.
- **The load order ≠ the profile list order**: the pinner activates before the governor at this
  boot - never rely on the bundle-list order for step ordering; the fold + the fresh-version writes
  make the order irrelevant.
- **The timestamp confusion**: the storage `at` values are epoch ms (UTC-based); the local display
  adds +03 - the "missing records" scares were filter mistakes.
- **The subagent stream quirks**: the subagents' tool-call content still gets normalized (even via
  raw-write - the exemption holds for the orchestrator's session only); the reliable routes:
  `\uXXXX` escape sequences + python byte-patches.
- **The async fold + the awaited Govern**: the tool's exec awaits the direct governance; the update
  step's awaited promise resolves at the DISPATCH (the background job keeps running) - never await
  the job.
