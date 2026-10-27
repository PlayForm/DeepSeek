---
title: The Dynamic Workspace - v4.1 distilled plan
category: Plans
kind: living-plan
date: 2026-10-21
status: active
registry: Documentation/Plans/WORKSPACE-FAMILY-V4-1.md
index: Documentation/INDEX.md
statuses:
    - name: the distillation of the 57-document corpus
      state: resolved
      evidence:
          this document - the best ideas kept, the ten contradictions named, the stale claims
          dropped
    - name: the graph schema v0 (nodes, edges, identity, invariants)
      state: open
      evidence: section 3; the RFC title existed but the schema never did
    - name: the block identity rule
      state: open
      evidence: section 3.2; the corpus asked the identity question and never answered it
    - name: the harness integration map (verified signatures)
      state: resolved
      evidence: cordis_inspect_query on ctx.lsp and ctx.storage; section 6
    - name: the package consolidation (16 -> 8 plus the lib)
      state: open
      evidence: section 7; the 16-package split violates the family's own two-consumer rule
    - name: the minimal vertical slice and its six acceptance checks
      state: planned
      evidence: section 8
    - name: the phased delivery P0-P5
      state: planned
      evidence: section 9
    - name: the research agenda R1-R13
      state: planned
      evidence: section 10
---

# The Dynamic Workspace - v4.1

This document is the distillation of the workspace epic. It keeps the corpus's best ideas, drops the
contradictions, replaces the abstract vocabulary with an executable core, and states the smallest
slice that proves the epic end to end. The old granular documents stay as the detailed record, and
where they disagree with this document, this document wins.

## 1. The verdict on the corpus

Fifty-seven documents produced zero implementation. The corpus is rich in design vocabulary and
accountability semantics, and it is empty where the epic actually lives: there is no schema for the
code-block graph, no index, no query language, no orientation budget, and no model-facing tool.

Two load-bearing assumptions are false in this build, verified live:

- **There is no LSP rename seam.** `ctx.lsp` exposes exactly
  `goToDefinition | findReferences | goToImplementation | hover`, with
  `LspQueryResult = locations | hover` and "no protocol escape hatch". A rename must be computed by
  the plugin from `findReferences`.
- **There is no multi-backend storage.** `ctx.storage` mounts data forms over `StorageBackend`,
  whose only facet is `kv?: KvFacet`; `KvUnit` is
  `loadAll | putRecord | deleteRecord | backupRecord? | setGlobal | close`, with no query, range
  scan, or graph traversal.

The corpus also splits into two systems that do not meet: the edit-centric decomposition (open,
insert, commit, close) and the evidence-centric representation-first research
(ManagedRepresentation, validation objects, discovery-query dependencies). Only three of the sixteen
packages map cleanly. The graph, which is the epic's core, is a "later stage" package in one system
and absent from the other.

## 2. The best ideas, kept

1. **The representation-first inversion.**

    The model operates on managed representations of files and code blocks, not on raw text, and the
    store is separate from the agent's context (`FRAMING-AND-LAYERS`).

2. **The ManagedRepresentation shape.**

    It carries identifier, resource, observedRevision, representationRevision, origin, completeness,
    freshness, permittedOperations, and pendingChanges (`INVERSION-AND-CONTRACTS`).

3. **The three independent authority concepts.**

    Capability, lease, and residency are not one object (`VIEWS-LENSES-AUTHORITY`), and the corpus's
    own `AUTHORITY.md` merged them and must be corrected.

4. **The four truths and evidence dependencies.**

    Reality, observation, representation, and intent are different truth claims, and the evidence
    dependencies invalidate on change (`RUNTIME-AND-TRUTH`).

5. **The recovery table and the honest metric.**

    The table gives per-obligation failure behavior, and the metric can be negative
    (`RECOVERY-FAIL-OPEN-MEASUREMENT`).

6. **The ten-step invisible flow.**

    Observe -> semantics -> operate -> govern -> authority -> approve -> merge -> journal -> audit
    -> live.

7. **The pitfalls log.**

    It records the seven real hazards, especially the license and weight conflation and the
    priority, retention, and permission distinction (`PITFALLS-LOG`).

8. **The NEXT-SLICE intent.**

    A narrow vertical slice proves the representation, not just an editing interface.

## 3. The executable core

### 3.1 The graph schema v0

The graph answers orientation questions. Its node and edge set is chosen by "which question does
this answer", not by completeness.

**Nodes (six kinds):**

| Kind       | Fields                                                                        | Answers                          |
| ---------- | ----------------------------------------------------------------------------- | -------------------------------- |
| File       | path, language, hash, version                                                 | where is this file, what changed |
| Symbol     | kind (function/class/type/const/interface), qualified name, span, fingerprint | where is X defined, what is X    |
| Block      | parent symbol or file, span, kind (body/comment/config-section), fingerprint  | which piece of code is this      |
| Test       | path, folder, name, target                                                    | what tests this                  |
| DocSection | path, heading, span                                                           | what documents this              |
| ConfigKey  | path, dotted key, type                                                        | where is this configured         |

**Edges (five kinds):**

| Edge       | From -> To                            | Answers        |
| ---------- | ------------------------------------- | -------------- |
| contains   | File -> Symbol/Block; Symbol -> Block | the structure  |
| imports    | File -> File                          | the dependency |
| references | Symbol/Block -> Symbol                | who uses X     |
| calls      | Symbol -> Symbol                      | the call graph |
| tests      | Test -> Symbol/File                   | what proves X  |

Optional v1 edges are `exports` (File -> Symbol), `documents` (DocSection -> Symbol/File), and
`configures` (ConfigKey -> File/Module). Add them only when a navigation question needs them.

**Invariants:** every node has a stable id and a fingerprint; every edge has a source span; a
symbol's span lies inside its file; a block's span lies inside its parent; the graph is acyclic for
`contains`; the graph carries the `indexRevision` it was built from.

**The fingerprint** is `sha256(normalized text + kind + qualified name)`, and the **stable id** is
`kind:path:qualified-name` for symbols and `block:path:startLine:kind` for blocks. The fingerprint
detects content change, and the stable id survives edits. R1 measures the churn of both before the
schema is frozen.

### 3.2 Block identity

The corpus asked the identity question and never answered it, so v0 answers it:

- A block is a contiguous span with a kind: a symbol body, a top-level statement group, a comment
  block, or a config section.
- Its id is `path + kind + start-line + qualified name` when it has one, and its fingerprint is the
  content hash.
- A rename changes the qualified name, so the id changes, and the fingerprint is the migration key,
  because the indexer re-links by fingerprint when the name moves.
- The model references a block by its id, and the tools return the id, the span, the fingerprint,
  and the version.

R1 measures the id churn across 20 edits before the rule is fixed.

### 3.3 The indexer

- The parse is file-scoped and incremental on `fs/observed`, and the index carries the `FsVersion`
  it observed.
- The parse covers TypeScript and JavaScript first, Markdown sections second, and JSON, TOML, and
  YAML config keys third. No other language runs until the first three are proven.
- The invalidation is file-scoped: a changed file re-parses, its outbound edges are rebuilt, and the
  reverse index for the changed symbols is updated. R4 measures the median cost per edit.
- The index store is a KV domain for the slice, because `KvUnit.loadAll` fits a single file's graph,
  and a benchmark (R3) decides between a larger KV layout and an external index for a repository.
  The `loadAll` memory wall is a known constraint, not a surprise.

### 3.4 The navigation contract

Four primitives, each a tool:

| Tool                | Input                        | Returns                                                                  |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------ |
| `workspace_map`     | path or module, depth        | the top-level modules, the file count, the entry points, the hot symbols |
| `workspace_find`    | name or pattern, kind, limit | the matching nodes with id, path, span, kind                             |
| `workspace_expand`  | node id, edge kinds, depth   | the neighbors (references, calls, imports, tests)                        |
| `workspace_context` | node id or query, budget     | the situation packet (section 3.5)                                       |

The result shape is a compact table plus the ids, with no full file bodies unless the caller asks
for a specific span. Pagination is by cursor, not by offset. R6 tests whether four primitives are
enough, and more are added only on a demonstrated unused-or-missing gap.

### 3.5 The orientation packet

The model orients in a loop: **orient -> drill -> act**. The packet is the orient step:

```text
WORKSPACE <name> @ <indexRevision>
SCOPE <the query or focus>
MAP <the top modules and their one-line roles>
FOCUS <the node, its span, its fingerprint, its version>
NEIGHBORS <the strongest edges, ranked>
EVIDENCE <the files/spans the packet is built from>
OPEN <the questions the packet cannot answer>
STALE <the version the caller held, if it differs>
```

The packet is bounded (target 2k tokens, hard cap configurable), ranked by edge strength (a call
beats a reference, a test beats a mention), and always carries the version so a stale view is
detectable. The packet is the carrier the corpus's `CONTEXT.md` gestured at, and the budget and the
ranking are the missing pieces.

### 3.6 The contract

One normative document, `WORKSPACE-CONTRACT.md`, with an acceptance test per clause:

1. **The graph schema and the invariants.**

    The schema and its invariants are normative, with an acceptance test per clause.

2. **The block identity rule.**

    The rule from section 3.2 is normative.

3. **The navigation primitives and their result shape.**

    The four primitives and the compact table are normative.

4. **The orientation packet and its budget.**

    The packet from section 3.5 and its token budget are normative.

5. **The authority model and the eviction dispositions.**

    Capability, lease, and residency, plus the eviction dispositions, are normative.

6. **The commit and recovery states.**

    The honest all-or-nothing statement is **recoverable partial states, never an invisible
    intermediate state**.

7. **The security boundary.**

    The clause covers every write path and the mediated path's guarantees.

8. **The migration and the `enabled=false` posture.**

    The migration path and the disabled posture are normative.

### 3.7 The state machines, consolidated

The corpus has four incompatible state machines, and v4.1 keeps two:

- **The edit lifecycle**:
  `observed -> represented -> proposed -> approved -> applying -> verified | recovery-required | conflict | denied`.
  This lifecycle replaces the `Process<File>` and `Halt/Spawn` variants.
- **The index lifecycle**: `absent -> indexing -> ready | stale | failed`, with `indexRevision` and
  the observed `FsVersion`.

The commit reply union is derived from the edit lifecycle, not from a separate six-way enum.

### 3.8 Conflict and merge

- The commit is a per-file `writeText(replaceIfVersion)`, and the workspace transaction is the
  ordered set of those writes plus the journal.
- A conflict is a `replaceIfVersion` failure or a preview mismatch, and it is reported with the
  expected and observed versions and the diff.
- The workspace does not promise a three-way merge in v1. It promises preview, version fence,
  recovery, and an explicit conflict. A merge engine is a later slice with its own research
  question.

### 3.9 Authority policy

- **Capability** is what the actor may do, **lease** is for how long, and **residency** is what
  stays in the store. These are three records with three owners.
- The eviction dispositions are `keep`, `defer`, `evict`, `discard`, and `promote`; the license
  decides, and the weight only ranks.
- The policy language is a small table of rules per resource kind, with defaults, TTLs, and the
  revocation timing. R12 simulates the hit rate under a memory cap.

## 4. The harness integration map (verified)

| Surface                                              | What it gives                                                                                                       | What it does not            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `ctx.fs`                                             | watch, resolve, stat, readText, streamText, readBytes, readByteRange, listDir, writeText(intent), editText(version) | no digest, no transaction   |
| `ctx.lsp`                                            | four read operations                                                                                                | no rename, no WorkspaceEdit |
| `ctx.storage`                                        | KV facet, `loadAll`, put/delete, `domain/changed`                                                                   | no query, no range scan     |
| `ctx.approval`                                       | policy, request, the approval waterfall                                                                             | no workspace semantics      |
| `ctx.systemPrompt`                                   | section/context/tools/variable + assemble                                                                           | no body rewrite             |
| `ctx.tokenMeter`, `ctx.toolResultPruner`, `ctx.jobs` | budgets, pruning, background work                                                                                   | unclaimed by the corpus     |

The rename engine computes its edits from `findReferences` plus its own symbol resolution, the graph
store fits the KV facet for the slice, and the orientation budget uses `ctx.tokenMeter` where
available.

## 5. The package consolidation

Sixteen packages plus a lib, before one consumer exists, violates the family's own rule that
extraction happens after two consumers. The release surface becomes eight plus the lib, and the
sixteen roles become internal modules:

| Package              | Internal roles                     |
| -------------------- | ---------------------------------- |
| `workspace`          | the agent, the tools, the query    |
| `representation`     | observe, evidence, journal         |
| `graph`              | semantics, graph, index            |
| `operate`            | propose, merge                     |
| `govern`             | govern, approve, authority, audit  |
| `context`            | the packet, the lenses, the budget |
| `monitor`            | the health, the performance        |
| `live`               | the client half (the panel view)   |
| `lib-workspace-live` | the shared client library          |

The Classic and EffectTS twins follow the family contract. The graph is P0, not phase 6.

## 6. The minimal vertical slice

One TypeScript file, three code blocks, six acceptance checks:

1. **The extraction.**

    Open one file, extract three blocks and their intra-file references, store them in a KV domain,
    and record the `FsVersion`.

2. **The navigation answers.**

    Answer three navigation questions from the packet while the file never enters context: where
    symbol X is defined, what references Y, and what block B depends on.

3. **The rename.**

    Rename a block-level symbol by computing the edits from `findReferences` plus our own edit set,
    then preview the changeset digest.

4. **The commit.**

    Commit through `fs.writeText(..., { kind: "replaceIfVersion", version })`, then verify that the
    applied bytes equal the preview.

5. **The crash.**

    Kill the process between the write and the journal, restart, report `recovery-required`, and
    complete or compensate.

6. **The acceptance.**

    The run needs 3/3 navigation answers correct without a full-file read, a digest match, the
    correct recovery outcome, at most 2k tokens per packet, and zero writes outside the mediated
    path.

This slice proves the representation, not just an editing interface, because the graph, the
orientation, the budget, the version fence, and the recovery are all exercised.

## 7. The phases

| Phase | Work                                                             | Acceptance                                                                     | Risk                                       |
| ----- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| P0    | The contract, the harness map, the schema v0, the state machines | every claim cites a verified signature; the ten contradictions settled one way | the contract becomes another essay; cap it |
| P1    | The slice (section 6)                                            | the six checks                                                                 | block identity churn; R1 first             |
| P2    | Recovery and authority                                           | kill at every step; no lost work; no silent overwrite                          | the journal domain                         |
| P3    | Scale and storage                                                | index this repo; p95 orient < 300ms; open < 2s                                 | the `loadAll` memory wall                  |
| P4    | The model-facing surface and the ablation                        | R5/R13; negative outcomes allowed                                              | the packet's token budget                  |
| P5    | Consolidation and the site page                                  | eight packages; the site documents the workspace                               | the twin cost                              |

## 8. The research agenda

R1 block identity churn; R2 the minimal node and edge set; R3 the KV versus external index; R4 the
incremental invalidation cost; R5 the bounded orientation versus full-file reads; R6 the minimum
query surface; R7 the presentation format; R8 the stale-view recovery; R9 the rename from
`findReferences`; R10 the honest all-or-nothing; R11 the `fs` contract; R12 the eviction policy; R13
the three-way ablation.

Each item has a hypothesis, a method, and an artifact in the assessor's table, and the v4.1 phase
order runs R1-R4 before the schema is frozen and R5-R8 before the tools are final.

## 9. The convergence with the UI epic

The visual panel is the workspace's natural surface: the family tab renders the map, the focus, and
the neighbors, the panel's `PanelSection` carries a `workspace` view, and the workspace's `live`
package supplies the sections. The two epics share one contract, because the panel renders what the
graph knows. This shared contract is why the workspace's `live` package and the UI's central panel
should be designed together, not separately.

## 10. The document upgrade map

- **Keep**: `FRAMING-AND-LAYERS`, `INVERSION-AND-CONTRACTS`, `VIEWS-LENSES-AUTHORITY`,
  `EVICTION-AND-PROPOSALS`, `RUNTIME-AND-TRUTH`, `CANDIDATES-AND-BOUNDARIES`,
  `APPROVAL-GUARANTEES-FAILURES`, `COMMIT-GOVERNANCE-AND-RECOVERY`, `AUTHORITY-AND-EVIDENCE`,
  `RECOVERY-FAIL-OPEN-MEASUREMENT`, `NAMING-BY-ROLE`, and `PITFALLS-LOG`.
- **Rewrite**: the workspace hub (counts, the process claim, and the phases),
  `INVERSE-REPRESENTATION` (one typing), `WORKSPACE-AGENT` (the tool surface), `GRAPH` (schema
  first), `CONTEXT` (the packet and the budget), `DATABASES-AND-CLOUD` (KV reality), `MERGE` (one
  state machine), `RECONCILIATION-MANDATE` (the contract), and `NEXT-SLICE` (the six checks).
- **Merge**: observe + evidence + journal -> representation; semantics + graph -> graph; operate +
  merge -> operate; govern + authority + approve -> govern; audit -> govern; reflect ->
  graph/operate.
- **Archive**: the literal halted-process passages, the intent model (to `INTENT-MODEL.md`,
  speculative), and `RESEARCH-PLACES` (the dead path).
- **New**: `WORKSPACE-CONTRACT.md`, `GRAPH-SCHEMA.md`, `BLOCK-IDENTITY.md`,
  `INDEXING-AND-INVALIDATION.md`, `NAVIGATION-AND-QUERY-CONTRACT.md`,
  `ORIENTATION-AND-CONTEXT-ASSEMBLY.md`, `STORAGE-BACKENDS.md`, `HARNESS-INTEGRATION-MAP.md`,
  `STATE-MACHINE-CONSOLIDATION.md`, `CONFLICT-AND-MERGE-SEMANTICS.md`, `AUTHORITY-POLICY.md`,
  `ADAPTER-INTERFACE.md`, `SECURITY-AND-WRITE-PATHS.md`, `MIGRATION-FROM-FILE-TOOLS.md`,
  `MINIMAL-VERTICAL-SLICE.md`, `BENCHMARK-AND-EVALUATION.md`, `SITE-SURFACE.md`, and
  `INTENT-MODEL.md`.

## 11. The decisions this plan needs

1. **The first slice's language.**

    TypeScript only, as proposed.

2. **The index store.**

    KV for the slice, and the external index for scale, with the R3 benchmark deciding.

3. **The package consolidation.**

    Eight packages plus the lib, with the sixteen roles as internal modules.

4. **The UI coupling.**

    The workspace `live` package and the panel contract are designed together.

5. **The intent model.**

    It stays quarantined as speculative until it has a schema, an owner, and a test.
