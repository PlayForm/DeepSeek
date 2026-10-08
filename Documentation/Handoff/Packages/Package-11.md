# Package 11 — THE STREAM-NORMALIZATION FAMILY (six flavors, all delegated)

> The user's directive: "split what you have done as a replacement, as one module of that plugin
> (normalization for stream) and also create other modules (flavors) for all of the other types of
> replacements possible" — with "develop only through subagents". All content by coder subagents
> (four agents + one resume: one crashed mid-flight, one stalled on a hanging pnpm install — both
> recovered per the crash pattern; the resume's `pnpm install --ignore-scripts` store-path install
> completed in ~1s). Part of `Documentation/Handoff/` — see `../Overview.md`.

## The architecture

- **The core** (`98be27b` + `c2beb06`) now owns the PURE normalization machinery:
  `Normalize/Replace` (class→string, function replacer, per- call regex) + `ReplaceMap` (char→char),
  the six tables (Dashes — the em/en/unicode dash class — Quotes, Ellipsis, Spaces, Invisible,
  Fullwidth), and `Stream/Chunk` + `Stream/Block` — GENERIC over structural shapes (no
  [dsh-llm](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm) import,
  devDep or symlink anywhere: a fragile node_modules symlink workaround for a cross-bundle
  nominal-type clash was replaced by the durable generic design; the guarded casts are documented —
  the `{ type: string }` catch-all survives every narrowing). The mdash is a thin delegate (45/45,
  zero assertion changes).
- **The six flavors** (`ad4c2c3` + `68afdcd`): mdash (dashes, exists) +
  `dsh-hook-normalize-{quotes,ellipsis,spaces,invisible,fullwidth}` — each the mdash pattern (thin
  Replace/Chunk/Block delegating to the core's injected-transform machinery, its own ledger
  `~/.dsh/<flavor>.log`, activation line, count line `normalized N <flavor> char(s) in one stream`,
  the normalizeReasoning/ normalizeToolArguments knobs, the deterministic build + its own
  pnpm-workspace.yaml). The MAP flavors (quotes/fullwidth) have NO replacement knob (the map is the
  identity); the CLASS flavors keep it (ellipsis `"..."`, spaces `" "`, invisible `""`). The profile
  carries all six (links + bundle entries after the mdash).
- **The smokes**: 5 new (45 checks each, the mdash template adapted) + the core smoke grew 8→14.

## The final state (all verified by the orchestrator)

```
The family is ELEVEN packages. tsc ×10 = 0 · builds ×10 = 0 · smokes ×11:
  core 14 · factory 31 · governor 71 · pinner 28 · cargo 58
  mdash 45 · quotes 45 · ellipsis 45 · spaces 45 · invisible 45 · fullwidth 45
```

The five new flavors ACTIVATE at the next app restart (bundle layers compose at boot) — each with
its own activation line + ledger. The live check afterwards: write nothing special — just use the
app; each flavor normalizes its chars in model output streams and logs
`normalized N <flavor> char(s) in one stream`.
