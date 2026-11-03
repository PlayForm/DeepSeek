# Adjacent

The session-history fold and the co-touch ranker against pure in-memory fixtures (no temporary
tree, no temporary home - the fold and the adjacency are pure), plus the workspace-root walk and
the opt-out of the built-in fallback against REAL temporary trees.

## Scenarios

- A1: the fold ignores every non-`tool/call` event (a different type, a missing type) and a
  malformed JSON-string arguments payload.
- A2: the fold parses a JSON-string arguments payload and extracts `file_path`.
- A3: the fold accepts an already-parsed object payload and falls back from `file_path` to `path`
  and to `filePath`.
- A4: the fold normalizes the path (backslashes become slashes, a leading `./` is stripped) and
  keeps the tool name and the sequence number.
- A5: `Adjacent` ranks a repeatedly co-touched path above a single one, orders equal counts by
  score (near neighbours first, `1 / (1 + distance)`), excludes the anchor itself and slices to the
  limit.
- A6: `Adjacent` respects the window (a co-touch beyond it contributes nothing) and the limit.
- A7: `Root` finds the directory that carries `package.json` and walks upward from a nested path to
  it.
- A8: `Root` falls back to the explicit cwd when no directory carries a marker, and returns
  `undefined` without one.
- A9: `Resolve` with `builtin: false` returns `undefined` for a workspace with no pack layer at
  all, while the default still returns the built-in pack.
- A10: `Resolve` with `builtin: false` still returns the layer when a repo layer exists.

## Expected count

10 PASS.
