# Changelog

All notable changes to this package will be documented in this file.

## Unreleased

### Changed

- The candidates come from the agent's OWN previous tool calls in this workspace: the new
  `session/event` listener folds every `tool/call` into the session's touch history (a WeakMap keyed
  on the session object, capped at 512 touches, fail-open), and the post-execute listener derives
  the candidates with `Adjacent`, so the note names the files that were touched right after the
  anchor.
- The co-touch rows are judged as ONE synthetic `History` family (priority 0, threshold 0.75, one
  signal of weight 2.5, companions with prior 0.6 and the reason
  `touched <n> time(s) after a similar call`), prepended as data to the compiled family list, so the
  existing Detect/Filter/Score pipeline, the knowledge store and the follow-through machinery are
  unchanged.
- A repo/user pack is now an EXPLICIT override: the listener resolves it with `builtin: false`, so
  the literal built-in pack is never a candidate source. A workspace with no pack and no history
  abstains with the new byte-exact line `abstained no-history  0.00`.
- The workspace root is pack-independent (the nearest ancestor carrying `.git` or `package.json`,
  resolved with `Root` of `@playform/lib-dsh-pack` instead of `Locate`), and a call with no such
  root abstains `abstained foreign-workspace  0.00`. The pack's declared signature no longer gates a
  call.
- The activation line's second segment is `history` (was `intents <n>`), because the boot pack
  projection is gone (`State.Pack` starts empty and `Function/Pack` is retired from the hot path).
- The offline seed's source is an explicit pack only, so a repo without one seeds nothing and the
  knowledge file keeps `seed: false` (no `seededAt` stamp) until a pack seed runs.
- The `suggestion_dismiss` tool knows the `History` family (plus an explicit pack's families) and
  refuses a former built-in family id.
- `Variable/Kinds` gives the synthetic `History` family the plain-file kinds, so the projection's
  kind test is meaningful for it.
- The fifteen smoke folders are rewritten onto the history candidates: every candidate scenario
  seeds the session history (or writes an explicit `.dsh/pack.yml`) in a temp workspace, and every
  silence asserts the `no-history` line. The benchmark measures the history path against a seeded
  history (`calls=50 notes=5 precision=1.00 recall=1.00 first-note=1`), and no suite names a
  built-in pack literal.

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.
- The activation version constant moves to 0.3.0, with the byte-identical ledger assertions moved in
  the same change.

## 0.2.0

### Added

- The search-intent suggester: the intent classification and projection surfaces, with their build,
  tests and bundle patch.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, the README
  restructured onto the role / surfaces / ledger template, and the README paragraphs split.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.
