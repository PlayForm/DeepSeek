# Package 6 — THE PITFALLS CATALOG (the 19 + the late additions)

> The pitfalls catalog: the 19 in the plugin-development skill, plus the factory-era additions 20–25.
> Part of `Documentation/Handoff/` — see `../Overview.md`.

The full 19-item catalog is in the plugin-development skill. The additions from the factory era:

20. **The factory's `.d.ts` alias leak** — unrewritten `@Interface/*` aliases in the built
    declarations resolve to the CONSUMER's own files when its tsconfig maps the same paths (TS2310
    circular bases). The governor's full-mirror strategy is the leak-proof one today; the fix is
    deterministic relative emit + named type exports (P0).
21. **The build race** — @playform/build's unawaited `exec()` for tsc/tsc-alias makes the `.d.ts`
    specifier style nondeterministic; rebuilds do not reproduce committed state (P0).
22. **The Inflight key collision** — the update stage and the factory's Continue both keyed
    `Inflight` by the plain targetKey; the cargo fixed it (`update:<targetKey>`), the GOVERNOR still
    has it live (P2).
23. **The three Config workarounds** — Schema-as-instance-method forces module-eval-time Config
    compositions: the governor hand-restates the shared block, the pinner news a factory on a stub
    context, the cargo calls `prototype.Schema.call(null, …)` (P1 — the standalone helper removes
    all three).
24. **The vacuously-green smoke** (see [Package 5 §3](Package-05.md)).
25. **The swapped/reversed asserts** — `assert.equal(boolean, string)` and count drifts (the 5→7
    fixture count) — read the assertion's intent before "fixing" the code.
