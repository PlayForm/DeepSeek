# Changelog

All notable changes to this package will be documented in this file.

## Unreleased

### Changed

- The session history is a `ctx.sessionProjections` unit (key `editHistory`), not a listener fold:
  the registry subscribes to `session/event` once and folds every committed `tool/call` through the
  unit's `apply`, so the suggester holds no subscription of its own. The unit is registered through
  the optional `ctx.inject(['sessionProjections'], ...)` form - a mount without the registry still
  loads - and read at detection time through `stateOf(session, key)`; a session the registry has not
  seen is rebuilt from the log on first touch. The `State.History` WeakMap and the `session/event`
  listener are gone.
- No post-execute append: the current call's `tool/call` is the durable STARTED record, committed
  before dispatch, so the anchor's prior touches are already in the projection state when
  `tools/post-execute` runs. An append would fold the current call twice and inflate every later
  co-touch count.
- The suggestions come from the agent's OWN previous tool calls in this workspace: the projection
  unit folds every call that names a path (capped at 512), the listener reads the session's cell
  through `stateOf(session, key)`, and `Adjacent` derives the candidates, so the note names the
  files that were touched right after the anchor.
- The co-touch rows are judged as ONE synthetic `History` family (priority 0, threshold 0.75, one
  signal of weight 2.5, companions with prior 0.6), so the existing Detect/Measure/Score/Decide
  pipeline, the `decided History` record and the follow-through machinery are unchanged.
- A repo/user pack is now an EXPLICIT override: the listener resolves it with `builtin: false`, so
  the literal built-in pack is never a candidate source. A workspace with no pack and no history
  abstains with the new byte-exact line `abstained no-history  0.00`.
- The workspace root is pack-independent (the nearest ancestor carrying `.git` or `package.json`),
  and a call with no such root abstains `abstained foreign-workspace  0.00`. The pack's declared
  signature no longer gates a call.
- The activation line's second segment is `history` (was `families <n>`), because the boot pack
  projection is gone (`State.Pack` starts empty and `Function/Pack` was removed).
- The four smoke folders are rewritten onto the projection seam: the wiring asserts the new
  activation line, the two listeners and the installed `editHistory` unit, the pack suite keeps the
  explicit `.dsh/pack.yml` case with a rooted fixture, the workspace gate commits its history
  through the projection drive and asserts the `History` note and the `no-history` abstention, and
  the post-execute suite adds the real-projection check (`State.History` absent, the cell advancing
  only through the drive).

### Fixed

- The session-history fold is fed by the durable `session/event` seam in its supported plugin-facing
  form (`ctx.sessionProjections`) instead of the hook's own raw `ctx.on("session/event", ...)`
  listener, which received nothing in the live harness. The suggester still registers two listeners,
  `tools/post-execute` and `agent/pre-step`; the projection unit registers separately and holds no
  listener.

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

- The edit suggester hook: the edit-proposal surface, with its full build, its documentation and its
  tests.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, the README
  restructured onto the role / surfaces / ledger template, and the README formatting pass.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.
