# Changelog

All notable changes to this package will be documented in this file.

## Unreleased

### Changed

- The suggestions come from the workspace graph and from nothing else: the `Neighborhood` intent is
  the connected component of the anchor (`ctx.workspaceGraph.neighborhood(path, limit)`) and the
  `Sibling` intent is that component's same-directory projection (the anchor excluded), both
  synthesized per judged call and prepended as data (priority 1 and 2, threshold 0.75, one `graph`
  signal of weight 2.5, targets with prior 1.0 and the entries' own reasons). Their confidence is
  `k = sigmoid(2.5 - 0.6) = 0.87`.
- The private literal pack is RETIRED from the hot path: `Source/Variable/Defaults.ts` keeps the
  domain's reference table but nothing imports it, and `State.Rules` starts empty at apply.
- The static fallback is gone: an empty component abstains with the new byte-exact line
  `abstained no-companions <Intent> <k>` instead of naming a literal path, while an absent or
  throwing service still logs `graph unavailable` once per apply and abstains
  `abstained graph-unavailable <Intent> <k>`.
- A judged call whose arguments carry no anchor path stays silent: there is nothing to ask the
  graph, so no intent applies and no line is written.
- The activation line's second segment is `graph` (was `intents <n>`), because the boot pack
  projection is gone.
- The three smoke folders are rewritten onto the graph-only model: no assertion names a literal pack
  path, the empty-component case asserts `no-companions`, and the Sibling case drives the
  same-directory projection through the `intents` filter (19, 6 and 15 checks).
- SCHEME.md, README.md and the bundle patch header document the graph-only model.

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

- The graph suggester hook: the graph-integrated proposal surface, with its build, its tests and its
  bundle patch.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, the README
  restructured onto the role / surfaces / ledger template, and the README formatting pass.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.
