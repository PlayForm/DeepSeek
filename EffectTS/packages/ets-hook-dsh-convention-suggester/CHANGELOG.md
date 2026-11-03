# Changelog

All notable changes to this package will be documented in this file.

## Unreleased

### Changed

- The suggestions come from the agent's OWN previous tool calls in this workspace: the new
  `session/event` listener folds every `tool/call` into the session's touch history (capped at 512),
  and the post-execute listener derives the candidates with `Adjacent`, so the notice names the
  files that were touched right after the anchor.
- A repo/user pack is now an EXPLICIT override: the listener resolves it with `builtin: false`, so
  the literal built-in pack is never a candidate source. A workspace with no pack and no history
  abstains with the new byte-exact line `abstained no-history  0.00`.
- The workspace root is pack-independent (the nearest ancestor carrying `.git` or `package.json`),
  and a call with no such root abstains `abstained foreign-workspace  0.00`.
- The activation line's second segment is `history` (was `intents <n>`), because the boot compile is
  empty.
- The literal pack learner (D4) was removed: no proposal file and no `learned proposal` ledger line.
  The `learning` config field remains in the schema as a retired compatibility field.

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

- The convention suggester hook: the convention-derived proposal surface, with its build, its tests
  and its bundle patch.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, and the
  README restructured onto the role / surfaces / ledger template with the static market index
  committed alongside.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.
