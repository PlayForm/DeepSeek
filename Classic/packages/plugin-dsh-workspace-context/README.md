# @playform/plugin-dsh-workspace-context

The workspace family's **context service**: the attention projection - the
required/relevant/deferred - the context economy.

- **The orientation packet** (V4-1 section 3.5): the eight fixed sections
  `WORKSPACE <name> @ <revision>` / `SCOPE` / `MAP` / `FOCUS` (the node, its
  span, its fingerprint, its version) / `NEIGHBORS` (the strongest edges,
  ranked) / `EVIDENCE` (the files/spans) / `OPEN` (the honest gaps) /
  `STALE` (the version the caller held, when it differs). Built from the
  sibling workspace-graph's index through a self-contained structural handle.
- **The budget**: target 2000 tokens (`budgetTokens`), configurable hard cap
  (`budgetMaximum`). Measured with the harness `ctx.tokenMeter` where
  available, else ~4 chars/token. Over budget, the weakest neighbors drop
  first; every clamp is ledgered.
- **The lenses**: `code` (default), `docs`, `tests` - the shipped catalog
  filters the eligible node and edge kinds.
- **The surfaces**: the `workspaceContext` service (declaration-merged
  accessor: `packet`, `lenses`, `focusOf`, `statistics`) and the read-only
  `workspace_context` tool.

The plugin ships **disabled** (the IDLE-forever posture): it never appears in
the profile's bundles and enables only by an explicit ACTIVATE.

Plan: Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5 +
Documentation/Plans/Workspace-Family/CONTEXT.md.
