# Package 8 — THE REFERENCES

> The reference paths as of 2026-10-04, plus the handoff's first final word. Part of
> `Documentation/Handoff/` — see `../Overview.md`. The queue that follows was executed in
> [Package 9](Package-09.md).

- The docs checkout: the local deepseek-harness docs checkout
  (subsystems/{filesystem,jobs,subprocess,llm-streaming}.md, cordis-api/events.md,
  user/develop/basic/{config,publish}.md, capability-seams.md, event-producer-consumer.md).
- The factory contract: `dsh-plugin-factory/SCHEME.md` (§2 the 15 methods, §3 the module contract —
  the Module vocabulary).
- The workspace docs: `Documentation/Guides/Governor-CASCADES.md` (the matrix),
  `Documentation/Guides/Governor-TRIO-GRAPH.md` (the graph + the P1–P9 research verdict),
  `Documentation/Guides/Governor-SCHEME.md` + `Documentation/Guides/Governor-README.md` (the synced
  bundle docs).
- The smokes: `/tmp/{factory,governor,pinner,cargo,mdash}-smoke.mjs`.
- The smokes' fixtures: `/tmp/governed-chain`-style dirs under
  the monorepo root (the sandbox root, the governed-chain fixture, the cargo-fixture).
- The repo: `~/.dsh` (git; the bundles under `profiles/desktop/bundles/`; the profile under
  `profiles/desktop/`).
- The family's ecosystem: the `@playform` packages (the conventions,
  @playform/build, @playform/compress as the reference packages).

## FINAL WORD FOR THE NEXT SESSION

The family is committed and green at runtime (all five smokes). The queue in
[Package 4-REVISION](Package-04.md) is the map: **start with the two P0s** (the factory .d.ts fix +
the deterministic build), then the Module rename, then the Schema helper, then the Inflight-key
helper, then the type-import flip, then the core extraction, then the granularization pass. The
smokes are the arbiter after every step. The user tests live tomorrow — coordinate the restarts.
