# Package 4 — THE QUEUE (what's left, most extensively)

> The queue as written 2026-10-04, plus the audit's critical revision (agent `8176b172`) that
> supersedes the ordering below. Part of `Documentation/Handoff/` — see `../Overview.md`.

Ranked order. Each item is one focused package — do them ONE AT A TIME, with the smokes as the
arbiter after each.

## 4.0 FIRST — the pending confirmation agent

`8176b172` (confirmation + granularization/factorization research) may still be running or its
report may be pending. Collect its verdict FIRST — it refines the items below (the exact
Module-rename scope inventory, the duplicate-declaration quantification, the core move list).

## 4.1 THE MODULE CODE RENAME (mechanical, safe — do FIRST after 4.0)

The spec docs (factory SCHEME.md/README.md) already say **Module**; the CODE still says `Flavor`.
The rename scope (all five bundles' `Source/`):

- `State.Flavor` → `State.Model`-→-`State.Module` (the State interface + the State builder + every
  consumer's local State declaration)
- `{flavor: "…"}` → `{module: "…"}` in the Apply calls
- the `flavor` parameter/comments in Attach/State/Apply/Transform headers
- the consumers' `Interface/Factory.ts` structural declarations

**MUST NOT change**: the ledger prefixes (`package-governor:`, `package-pinner:`, `cargo-governor:`,
`mdash:`) — they come from the module name VALUES, not the field NAME — and the activation strings
(smoke-asserted byte-identical). After the rename: tsc ×5, rebuilds ×5, all five smokes must still
pass with ZERO assertion changes.

## 4.2 THE FACTORY v0.1.1 PASS (three confirmed candidates + one polish)

1. **The `.d.ts` alias leak** — the factory's built `Target/*.d.ts` ships UNRESOLVED `@Interface/*`
   path aliases; any consumer whose tsconfig maps the same paths resolves them to ITS OWN files
   (circular base types — TS2310). Confirmed by BOTH the governor and the mdash agents. Fix: emit
   relative specifiers in the declarations (tsc-alias on the .d.ts, or relative paths in the
   tsconfig out). THEN: the three consumers can delete their local structural
   `Interface/Factory.ts` + the State/Gate/Transform/ Output duplicates and import the real types —
   a big dedup (quantified by the 4.0 research).
2. **A standalone Schema helper** — `Factory.Schema` is an instance method, but the loader needs
   `Config` at MODULE-EVALUATION time (before any ctx/service exists) — a consumer cannot literally
   `export const Config = factory.Schema(...)`. Fix: a module-level schema-building function (it
   uses no `this`) exported alongside the service; the consumers' locally composed schemas (exact
   shape) then become one-liners.
3. **The namespaced Inflight-key helper** — the cargo collision lesson (the update stage's
   `Inflight` key collided with the factory's plain `String(targetKey)` — fixed flavor-side with
   `update:<targetKey>`). The factory should document the plain-key contract AND/OR offer a
   namespaced registration helper so future modules don't repeat it.
4. **Schema's optional shared block** — `Schema(shared?, module?)` hardcodes the
   [fs/observed](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts)
   shared fields (updateCooldownMs/mutationTools/policyFile/ exclude) — a non-manifest module (the
   mdash) cannot omit them. Make the shared block optional (`shared: false` or a minimal-shared
   option).

## 4.3 THE @playform/dsh-hook-core EXTRACTION (the pure TS package)

A separate, dependency-free, harness-free package for the pure commonalities: `Match`, the cell
`Unwrap`, `Decode`, the version-string helpers (parse/pad — the cargo Normalize + the pinner range
law + the governor's canonicalization), the shared schema-field SPECS (plain data), the ledger line
formatting. Consumption:

- the FACTORY depends on it (its `dependencies`) and re-exports the pure methods — its 15-method
  contract unchanged ("batteries included");
- the MODULES' transforms import the helpers directly (the one place they legitimately import a
  non-harness package — the transforms are pure);
- usable outside the harness entirely (the user's PlayForm ecosystem). Design: zero deps, its own
  unit smoke (no fake ctx needed), same Source/→Target/ layout, prepublishOnly-only, publishable.

## 4.4 THE LIVE FAMILY TEST (tomorrow — the restart battery)

After the rename + factory pass: ONE restart, then:

1. Activation: the four new activation lines in the four ledgers (factory has none — it registers no
   activation; the modules do).
2. The governor + pinner on one registry-governed package.json write — the interlock (chain
   canonicalized once, public deps pinned, bounded passes).
3. The update stages as REAL harness jobs — `job_list` shows `governor-update` entries with statuses
   (the cargo's `cargo upgrade` digest + `excluded: serde`).
4. A Cargo.toml write — chain + normalization + the real cargo upgrade.
5. The mdash — a live model response with em-dashes → the transcript and `~/.dsh/mdash.log` show
   `mdash: normalized N dash char(s) in one stream`.
6. Silence everywhere else (the author threads never learn).

## 4.5 THE GUARDIAN PLUGIN (the discipline enforcement — later, noted)

The code-authoring skill §1b holds the note: a `tools/pre-execute` guardian that detects terminal
file-EDIT commands (sed -i/awk/python-in-place/ heredoc surgery) — Mode A: deny with a structured
reason (self-teaching from the surfaced error); Mode B (later, ideal): the SILENT REWRITE flag —
best-effort command→tool-call rewriting, invisible to the model. This is the model-independent
enforcement of the tool discipline.

## 4.6 OPPORTUNISTIC (whenever)

- The tsc-alias `.d.ts` nondeterminism (the pass agent's finding — some builds emit unrewritten
  aliases; type-only, zero runtime impact).
- The `--dump-config` verification path is GONE (the Electron-managed profile guard) — the ledgers +
  Inspect are the activation assessors.
- The workspace docs (`Documentation/Guides/Governor-*.md`, the Handoff — this tree) live untracked
  in the workspace repo — the user manages their own commits.

---

# PACKAGE 4-REVISION — THE AUDIT'S CRITICAL FINDINGS (2026-10-04, agent 8176b172)

The confirmation agent found THREE things that change the queue. Read this BEFORE acting on
Package 4.

## CRITICAL 1 — the pinner's tsc is RED (5 errors) — a live latent break

`dsh-hook-package-pinner` `npx tsc --noEmit` fails: TS2339 ×4 (Ledger/List/ Stash/Context missing on
State) + TS2310 (State recursively references itself as a base type). Mechanism: the pinner's State
derives via `Parameters<Factory["Append"]>[0]`; the factory's built `Target/Library.d.ts` ships
UNREWRITTEN `@Interface/*` aliases; the pinner's tsconfig maps the same paths → the factory's
declaration import resolves to the PINNER'S OWN State → circular. RUNTIME IS UNAFFECTED (the smoke
passes 28/28) — it is type-only. The pre-existing local-Interface declaration strategies (governor
full-mirror, mdash subset) are the leak-proof ones.

## CRITICAL 2 — the build is NONDETERMINISTIC (the @playform/build race)

@playform/build 0.3.4's TypeScript hook runs `tsc` then `tsc-alias` through an `exec()` that is
NEVER awaited (verified in the installed copy) — the emitted `.d.ts` specifier style (aliases vs
relative) depends on timing. Consequence: REBUILDING DOES NOT REPRODUCE THE COMMITTED STATE
(demonstrated on cargo — the mandated rebuild regenerated alias specifiers; restored with
`npx tsc-alias -f -p tsconfig.json`). The committed factory Target currently has alias specifiers
(the leak's source).

## CRITICAL 3 — the governor has the SAME Inflight collision the cargo fixed

cargo's `Update/Key.ts` (`update:<targetKey>`) fixed its collision; the GOVERNOR's Dispatch.ts:67 +
Settle.ts:23 still register/delete under the PLAIN targetKey — the same key the factory's Continue
uses. Live window: an in-flight ncu run under key K + an external edit → the new Continue pass sets
the same K and its finally deletes it → the P2 unload-disposal can miss the running update's
controller. Must be fixed (the helper moves factory-side — queue item 5).

## THE AUDIT'S REFINED QUEUE (supersedes 4.2/4.3 ordering)

1. **P0 — the factory .d.ts fix**: deterministic relative-specifier emit + NAMED type exports
   (State/Gate/Transform/Output/Options) from the factory entry (it currently exports none).
   Acceptance: tsc ×5 zero errors. (The minimal unblock alternative: pinner switches to the
   governor's structural-mirror pattern.)
2. **P0 — the deterministic build**: await the tsc/tsc-alias child (or move `tsc && tsc-alias` into
   explicit script steps). Acceptance: rebuild ×5 leaves the tree clean.
3. **P1 — the Module rename** (the exact scope inventory: factory 21 code lines + ~84 comment lines;
   consumers' State fields + 4 setup keys + docs
    - targets + 14 smoke references; keep-list: the ledger PREFIX VALUES, the activation strings
      incl. cargo's literal "cargo flavor" wording, the effect labels, journal events, patch ids,
      package names).
4. **P1 — the standalone module-level Schema helper + the optional shared block** — then delete the
   THREE Config workarounds (governor's hand-built block, pinner's stub-context `new Factory(Stub)`,
   cargo's `PluginFactory.prototype.Schema.call(null, …)`).
5. **P2 — the Inflight-key helper factory-side + governor adoption** (the live collision) + a smoke
   case for the collision window.
6. **P2 — the consumer type-import flip**: after 1, delete the local structural mirrors (~160
   governor lines, ~45 cargo, pinner's extraction restored, mdash widened) — one strategy: type-only
   import + augmentation.
7. **P3 — @playform/dsh-hook-core**: the REFINED move list (Match/Unwrap are already factory; the
   core = the transform-builder composition, the update-stage envelope, the update-policy loader,
   the journal-entry shape, Section/Default, the suppression-line composer). The factory re-exports
   NOTHING from core (the 15-method surface stays stable); transforms import core directly. AFTER
   1/4/5.
8. **P4 — granularization + naming unification**: split cargo Pin.ts (333) / Update/Upgrade (298) /
   governor Update/Bin (227) / cargo Transform (206); unify Passage vs Plan, Run vs Execute role
   names, the hardcoded `package-governor:` suppression prefixes → `State.Module` composition
   (governor Follow.ts:60 + Observe.ts:108), cargo's stale "ctx.jobs is AGENT-SCOPED" comment
   (Dispatch.ts:4-6 — refuted), the explicit-undefined owner key vs omitted-key drift, and
   confirm/fix the cargo journal-parity gap (no dispatched/update-failed records).
