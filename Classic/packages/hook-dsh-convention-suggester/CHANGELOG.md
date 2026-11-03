# Changelog

This file documents all notable changes to this package.

## Unreleased

### Changed

- The session history is a `ctx.sessionProjections` unit (key `conventionHistory`), not a listener
  fold: the registry subscribes to `session/event` once and folds every committed `tool/call`
  through the unit's `apply`, so the hook holds no subscription of its own. The unit is registered
  through the optional `ctx.inject(['sessionProjections'], ...)` form - a mount without the registry
  still loads - and read at detection time through `stateOf(session, key)`. The `State.History`
  WeakMap and the in-listener fold are gone.
- No post-execute append: the current call's `tool/call` is the durable STARTED record, committed
  before dispatch, so the anchor's prior touches are already in the projection state when
  `tools/post-execute` runs. An append would fold the current call twice and inflate every later
  co-touch count.
- The suggestions come from the agent's OWN previous tool calls in this workspace: the projection
  unit folds every call that names a path (capped at 512) and the listener derives the candidates
  with `Adjacent`, so the notice names the files that were touched right after the anchor.
- A repo/user pack is now an EXPLICIT override: the listener resolves it with `builtin: false`, so
  the literal built-in pack is never a candidate source. A workspace with no pack and no history
  abstains with the new byte-exact line `abstained no-history  0.00`.
- The workspace root is pack-independent (the nearest ancestor carrying `.git` or `package.json`),
  and a call with no such root abstains `abstained foreign-workspace  0.00`.
- The activation line's second segment is `history` (was `intents <n>`), because the boot compile is
  empty.
- The literal pack learner (D4) was removed: no proposal file and no `learned proposal` ledger line.
  The `learning` config field remains in the schema as a retired compatibility field.

### Fixed

- The session-history fold is fed by the durable `session/event` seam in its supported plugin-facing
  form (`ctx.sessionProjections`) instead of the hook's own `tools/post-execute` stream. A raw
  `ctx.on("session/event", ...)` listener received nothing in the live harness, so the fold stayed
  empty and every judged call logged `abstained no-history  0.00` even after repeated edits. The
  hook still registers three listeners: `loader/volatile-update`, `tools/post-execute` and
  `agent/pre-step`; the projection unit registers separately and holds no listener.

### Added

- The new `noiseFloor` config field (default `0.5`) sets the minimum confidence a candidate must
  have to be considered at all.

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together - the host line to `0.2.1-rc.4` and zod to 4.6.7.
- The activation version constant moves to 0.3.0.

## 0.2.0

### Added

- This release adds the convention suggester, the convention-derived proposal surface, with its
  build configuration, its tests, and its bundle patch.

### Changed

- The D4-D8 release pass refines the source of the hook, its scheme, and its bundle patch, and the
  pack and trace libraries ship across both trees.
- The documentation passes clean up the markdown across the repository, restructure the README onto
  the role / surfaces / ledger template, and split the README paragraphs to the house wrapping.

## 0.1.0

### Changed

- This package has no local history, because it does not exist in the 0.1.0 release and it lands
  afterwards with the 2026-10-22 PoC delivery.
