# Changelog

All notable changes to this package will be documented in this file.

## Unreleased

### Changed

- The recall is validated against the tree: the durable store is cross-session by design, so a
  recalled record may name a deleted path, a bare directory, or the call's own anchor. The anchor is
  excluded and only an existing regular file is named (`Function/Exists`'s `IsFile`, the
  `existsSync` plus `statSync(...).isFile()` predicate), so a missing path and a directory are never
  named. A recalled path in the anchor's OWN DIRECTORY now wins outright - when one survives, only
  those paths are named, because a recall from the same folder is the strong signal (a live test
  named unrelated subtrees from an earlier session). Without such a neighbor the same-tree partition
  still applies (Classic with Classic, EffectTS with EffectTS) and never drops a valid other-tree
  file; a record with no surviving file keeps the existing `abstained no-companions <Intent> <k>`
  line, and the same-directory rule adds no new ledger line.
- The candidates come from the agent's OWN previous tool calls: a recalled record is synthesized
  into ONE `Repeat` family (priority 0, threshold 0.75, one `history` signal of weight 2.5, the
  recalled files as its targets with prior 1.0 and the `touched last time (<intent>)` reason), and
  it is placed FIRST in the rules the classifier consumes, so the note reads
  `intent=Repeat confidence=0.87` and the `suggest Repeat 0.87 <n> candidates call <tool>` line is
  unchanged in shape.
- The literal built-in pack was removed from the hot path: `State.Rules` starts empty at apply, and
  `Variable/Defaults` (the `Families(Builtin, "replay")` projection) was removed from the package.
  The history lift is gone with it: the history evidence is the synthesized family's signal, so
  `Function/Detect` takes no lift and `Function/History` exports no `LIFT`.
- A repo/user pack is now an EXPLICIT override: the listener resolves it with `builtin: false`
  (`Resolve(root, { home: Home(), builtin: false })`), so a hand-written `replay/` family still
  speaks (its id and caveat may outrank the synthesized family) and a literal pack never does. A
  workspace with no pack and no record abstains with the new byte-exact line
  `abstained no-history  0.00`.
- The workspace gate is pack-independent (the nearest ancestor carrying `.git` or `package.json`,
  `Root(CallPath, Cwd)`), so a pack's declared `signature` no longer gates a call; a call with no
  such root abstains `abstained foreign-workspace  0.00`.
- The activation line's second segment is `history` (was `intents <n>`), because the boot pack
  projection is gone. The fourth segment stays the seeded store's record count.
- The seeded store (`historyPath`) is now an OPTIONAL user seed: still read-only, still loaded once
  at apply, still the first recall source, but no longer required for the hook to speak.
- The five smoke folders are rewritten onto the recall-first model: the loader suite asserts the new
  activation line and the synthesized note; the producer suite asserts the `no-history` abstention
  and the synthesized caveat; the pipeline suite keeps the recall cases at `0.87` and the
  `no-history` abstention; the workspace gate uses a `package.json` root marker instead of the pack
  signature; the pack suite covers the explicit pack, the pack-less recall, the `no-memory` pack
  case, and the `no-history` case. No assertion names a built-in pack literal.

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
- The storage-domain table cast: the zod 4.6.7 schemas are cast to the host library's `domainTable`
  parameter type, because `@deepseek-ai/dsh-storage-domain` types its tables against its own zod
  4.4.3 and the inference otherwise fails with TS2589.

## 0.2.0

### Added

- The replay suggester hook: the session-replay suggestion surface, with its build, its tests and
  its bundle patch.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, the README
  restructured onto the role / surfaces / ledger template, and the README formatting pass.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.
