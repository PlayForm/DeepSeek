---
title: The Workspace Family - the Wave 1 brief (the graph and the observe foundation)
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-22
status: active
registry: Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md
index: Documentation/INDEX.md
statuses:
	- name: the wave plan for the full suite (W1-W8)
		state: planned
		evidence: this document section 2
	- name: the W1 frozen contract (the graph schema v0 and the observe stamps)
		state: designed
		evidence: this document sections 4-5
	- name: the W1 lanes (the graph and the observe, Classic)
		state: open
		evidence: the Team board tasks; the lanes' reports
---

# THE WORKSPACE FAMILY - THE WAVE 1 BRIEF (THE GRAPH AND THE OBSERVE FOUNDATION)

> The Lead's frozen contract for the first development wave of the full
> workspace suite. Every lane reads this document BEFORE it writes.
> The plans: Documentation/Plans/WORKSPACE-FAMILY-V4-1.md (the superseding
> distillation - the schema, the slice, the integration map) and
> Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md (the 16-role
> family map - the package names). Where they disagree: v4.1 wins for the
> schema and the slice; the package names come from the family MANIFEST
> (Temporary/npm-bootstrap/MANIFEST.json).
> The user's route for this wave: cloudflare-workers-ai /
> @cf/zai-org/glm-5.3-flash / reasoningEffort low. No lane raises the route
> without the Lead's explicit instruction.

---

## 1. The laws every lane loads first

Read these BEFORE writing anything. The repo copies win over the global ones.

| Law                | Path                                              |
| ------------------ | ------------------------------------------------- |
| Code authoring     | Documentation/Skill/code-authoring/SKILL.md        |
| Plugin API         | Documentation/Skill/plugin-development/SKILL.md    |
| Family contract    | Documentation/Skill/plugin-system/SKILL.md         |
| Smoke writing      | Documentation/Skill/smoke-writing/SKILL.md         |

The global copies are at ~/.dsh/skills/<name>/SKILL.md; load either, not both.

The hard rules restated (the short form):

1. Content changes go through the write/edit tools ONLY. No sed -i, no awk,
   no perl -pi, no heredoc surgery, no cp of content files. Read with the
   read/grep/glob tools ONLY. `rm` is allowed for deletion (verify the
   absolute path first). No git mutations; the report ends READY-TO-COMMIT.
2. One definition per file, nameless default exports, PascalCase full-word
   names, inline single-use bindings, `switch (true)` for guard chains of
   three or more arms.
3. The loader contract: the default object carries `name`, `apply`,
   `Config`, `inject`. `apply` returns NOTHING. A bad config fails loud.
4. The identity lives in four agreeing places: the package name, the `name`
   export, the State build's `module:` option, the ledger logFile default.
5. The ledger strings are the contract: byte-stable, module-owned, asserted
   byte-exactly in the smoke.

## 2. The suite and the wave order

The full suite: the workspace family (16 roles) + the batch-edit engine + the
orchestration plugins. Classic first, the ETS twins after.

| Wave | Packages (Classic)                                                                  | Gate                        |
| ---- | ----------------------------------------------------------------------------------- | --------------------------- |
| W1   | plugin-dsh-workspace-graph, hook-dsh-workspace-observe                              | build green + smoke counts  |
| W2   | hook-dsh-workspace-operate, hook-dsh-workspace-merge                                |                             |
| W3   | hook-dsh-workspace-govern, plugin-dsh-workspace-authority, hook-dsh-workspace-journal |                           |
| W4   | plugin-dsh-workspace, plugin-dsh-workspace-context                                  |                             |
| W5   | plugin-dsh-workspace-semantics, plugin-dsh-workspace-evidence, hook-dsh-workspace-approve, hook-dsh-workspace-audit | |
| W6   | hook-dsh-workspace-monitor, plugin-dsh-workspace-live, lib-dsh-workspace-live       |                             |
| W7   | plugin-dsh-batch-edit (on the operate layer), plugin-dsh-route, plugin-dsh-queue    |                             |
| W8   | the ETS twins (Maintain/generate-ets-*.mjs) + the parity smokes                     |                             |

The v4.1 consolidation (8 packages plus the lib) is an OPEN user decision.
Until the user decides, the MANIFEST's 16 role names are the build target;
each role keeps its own Config, ledger strings, and tools (the distribution
law: never one monolith).

## 3. The package anatomy (both lanes)

Copy the anatomy from Classic/packages/hook-dsh-live-containers by READING its
files and WRITING the new ones with the write tool. Never `cp`, never `sed`.
The files:

- `package.json` - name, version 0.1.0, the live-containers shape:
  `type: module`, exports (`.` -> Target/Library.js + .d.ts, plus
  `./cordis.patch.yml`, `./SCHEME.md`, `./package.json`), main/types, files
  (`Target`, `!Target/Test`, `cordis.patch.yml`, `README.md`, `SCHEME.md`),
  scripts (`Run`, `prepublishOnly`), dependencies (both W1 packages depend on
  `@playform/plugin-dsh-factory: 0.1.0` and `@playform/lib-dsh-core: 0.1.0`),
  devDependencies copied verbatim from live-containers, publishConfig, and
  `dsh.bundle.patch: ./cordis.patch.yml`.
- `tsconfig.json` - the live-containers shape (outDir Target, rootDir Source,
  the `@Function/*`, `@Interface/*`, `@Variable/*` paths, extends
  `@playform/build/tsconfig`, include Source, exclude Source/Test).
- `Configuration/ESBuild.ts`, `Configuration/Test-ESBuild.ts`,
  `Configuration/TypeScript.noemit.json`,
  `Configuration/TypeScript-Test.noemit.json` - the live-containers twins,
  adapted only in the header comment.
- `Source/prepublishOnly.sh`, `Source/Run.sh` - the live-containers scripts
  verbatim (the negation pattern and the Harness selfcheck are mandatory).
- `Source/Library.ts` - the loader contract; for the graph the CLASS form
  (`export default class ... extends Service` with
  `super(Context, "workspaceGraph")`, `static inject = ["fs", "storage"]`),
  for the observe the OBJECT form (name/apply/Config/inject) that also
  provides the `workspaceObserve` service (extend Service in its own module
  and register it from apply).
- `Source/Function/`, `Source/Interface/`, `Source/Variable/` - one
  definition per file.
- `Source/Test/Harness.ts` + `Source/Test/<Folder>/Test.ts` +
  `Source/Test/<Folder>/README.md` with `## Expected count` and `<N> PASS.`.
- `cordis.patch.yml` - the bundle patch row, `enabled: false` (the
  IDLE-forever posture; the row carries the full Config defaults).
- `README.md`, `SCHEME.md` - short, factual, no claims the code does not meet.

The build and the arbiters:

```sh
pnpm --dir Classic/packages/<pkg> run prepublishOnly     # build + tsc + tsc-alias
node Classic/packages/<pkg>/Target/Test/<Folder>/Test.js # one folder
node Maintain/Run-Smokes.mjs                             # the aggregate (the Lead runs it)
```

Never run `pnpm install`: the root hoisted toolchain is ready (Build, tsc
7.0.2, tsc-alias, esbuild are in the root node_modules). Never edit
Target/ - it is build output.

## 4. The frozen contract - the graph schema v0 (plugin-dsh-workspace-graph)

### 4.1 The node and edge kinds

Six node kinds and five edge kinds exist in the model; W1 parses four node
kinds and two edge kinds. The rest is deferred to W2+ and must NOT be faked.

| Node kind  | id form                                  | W1  |
| ---------- | ---------------------------------------- | --- |
| File       | `File:<path>`                            | yes |
| Symbol     | `Symbol:<path>:<qualified name>`         | yes |
| Block      | `Block:<path>:<startLine>:<kind>`        | yes |
| Test       | `Test:<path>`                            | yes |
| DocSection | `DocSection:<path>:<startLine>`          | yes (Markdown) |
| ConfigKey  | `ConfigKey:<path>:<dotted key>`          | no  |

| Edge kind  | from -> to                    | W1  |
| ---------- | ----------------------------- | --- |
| contains   | File -> Symbol/Block/DocSection | yes |
| imports    | File -> File                  | yes (relative imports) |
| references | Symbol/Block -> Symbol        | no  |
| calls      | Symbol -> Symbol              | no  |
| tests      | Test -> Symbol/File           | no  |

The v4.1 invariants that W1 enforces: every node has a stable id and a
fingerprint; every edge has a source span; a symbol's span lies inside its
file's span; a block's span lies inside its parent's span; `contains` is
acyclic; the graph carries the `indexRevision` it was built from.

The fingerprint: `sha256(normalized text + "\n" + kind + "\n" + name)` in
hex, where normalized text is the node's span text with `\r\n` -> `\n` and
trailing whitespace stripped per line. The stable id survives edits; the
fingerprint detects content change. Both are printed by the tools and the
smoke asserts both.

### 4.2 The parser (v0, honest about its limits)

- TypeScript/JavaScript: a line/regex scanner (no compiler API in W1).
  File node over the whole text. Symbols for `function`, `class`,
  `interface`, `type`, `enum`, `const`, `let`, `var` declarations (the
  exported and the non-exported alike; the qualified name is the
  declaration name, nested names are NOT resolved in v0). A symbol's span
  runs from its declaration line to its closing brace (brace counting; a
  declaration without a brace ends at its statement line). One Block node
  per symbol body (kind `body`), span inside the symbol's span.
- Imports: `from "<specifier>"` and `import("<specifier>")` with a relative
  specifier -> an `imports` edge File -> File whose target id is
  `File:<the path resolved against the file's directory>`. A non-relative
  specifier produces no edge in v0 (recorded as a skipped import in the
  outcome, not as a fake node).
- Test files: a path matching `*.test.ts`, `*.test.tsx`, `*.test.js`, or a
  `/Test.ts` segment -> one Test node + a `contains` edge from the File.
- Markdown: one DocSection per `^#{1,6} ` heading, span from the heading
  line to the line before the next heading of the same or higher level;
  `contains` edges File -> DocSection.
- Config files: not parsed in W1.

### 4.3 The service surface (`ctx.workspaceGraph`)

Declaration merging into the cordis Context gives the typed accessor. The
service is a `Service` subclass registered under the exact name
`workspaceGraph`. The methods:

```ts
type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";
type EdgeKind = "contains" | "imports";

interface Span {
	startLine: number; // 1-based, inclusive
	endLine: number;   // 1-based, inclusive
}

interface Node {
	id: string;
	kind: NodeKind;
	path: string;
	name?: string;
	language?: "typescript" | "javascript" | "markdown";
	span?: Span;
	fingerprint: string;
	version: string;
}

interface Edge {
	kind: EdgeKind;
	from: string;
	to: string;
	span?: Span;
}

interface IndexOutcome {
	path: string;
	status: "indexed" | "skipped" | "failed";
	nodes: number;
	edges: number;
	version?: string;
	reason?: string;
}

interface FindQuery {
	name?: string;
	pattern?: string;
	kind?: NodeKind;
	limit?: number;
}

interface Expansion {
	nodes: Node[];
	edges: Edge[];
}

interface GraphSnapshot {
	indexRevision: string;
	nodes: Node[];
	edges: Edge[];
}

interface GraphStatistics {
	files: number;
	nodes: number;
	edges: number;
	indexRevision: string;
}
```

- `async indexFile(path: string): Promise<IndexOutcome>` - resolve through
  `ctx.fs.resolve` (cwd = the session working directory), stat, read, parse,
  store the per-file record, bump `indexRevision`, ledger.
- `async removeFile(path: string): Promise<boolean>` - delete the record,
  bump, ledger.
- `getNode(id: string): Node | undefined`
- `find(query: FindQuery): Node[]` - the limit defaults to
  Config.limitDefault and is capped at Config.limitMaximum.
- `expand(id: string, options?: { kinds?: EdgeKind[]; depth?: number }): Expansion`
  - depth defaults to 1, capped at 3.
- `snapshot(): GraphSnapshot`
- `statistics(): GraphStatistics`

### 4.4 The store

The KV facet through the storage domain: open the domain named
Config.domain (default `workspace_graph`), one record per path
(key = the path, value = `{ version, fingerprint, nodes, edges }`), plus one
meta record keyed `__meta` carrying `{ indexRevision }`. The domain API:
read `Classic/packages/plugin-dsh-factory/Source/Function/Journal.ts` for
the exact `ctx.storage` / `storageDomain.open` pattern and the
`loadAll`/`putRecord`/`deleteRecord` shape. `snapshot()` loads all records
(`loadAll`); a record that fails validation is skipped and counted, never
guessed.

### 4.5 The Config (Schemastery, all volatile)

| Field             | Type                          | Default                  |
| ----------------- | ----------------------------- | ------------------------ |
| enabled           | boolean                       | false                    |
| domain            | string                        | "workspace_graph"        |
| languages         | array of the three languages  | all three                |
| include           | array of glob strings         | []                       |
| exclude           | array of glob strings         | node_modules/**, **/Target/**, **/.git/** |
| maxFileBytes      | number                        | 1000000                  |
| maxNodesPerFile   | number                        | 5000                     |
| limitDefault      | number                        | 50                       |
| limitMaximum      | number                        | 500                      |

Invalid config fails loud at load (the Schemastery schema; a smoke asserts
it).

### 4.6 The ledger lines (module-owned, byte-stable)

```text
graph: activated (domain=<domain>, languages=<n>)
graph: indexed <path> version <version> (<nodes> nodes, <edges> edges)
graph: skipped <path> (<reason>)
graph: failed <path> (<reason>)
graph: removed <path>
graph: domain <domain> opened (<records> records)
```

Every line goes through the family's ledger append (the factory's Append or
the module's own logger + appendFileSync - read the factory's Append for the
pattern). The smoke asserts each line byte-exactly.

### 4.7 The W1 acceptance checks (the lane prints them)

- A1 `pnpm --dir Classic/packages/plugin-dsh-workspace-graph run prepublishOnly`
  exits 0 (ESBuild + tsc + tsc-alias).
- A2 the smoke folders print `N PASS - <Name>` matching their README counts;
  total N >= 12.
- A3 the service registers on the fake ctx under `workspaceGraph`; the
  declaration merging compiles.
- A4 a fixture TypeScript file yields exactly the expected File node, the
  expected Symbol nodes, the expected Block nodes, and the expected
  `contains`/`imports` edges (the fixture is committed in the test folder).
- A5 ids are stable and fingerprints are content-derived: re-indexing the
  unchanged file keeps every fingerprint; changing one symbol changes that
  symbol's fingerprint and the file's, and leaves the other symbols' intact.
- A6 the store round-trips through the fake KV domain: `snapshot()` returns
  what `indexFile` stored; `indexRevision` increments.
- A7 the fake fs records ZERO `writeText` calls (the plugin writes nothing
  outside its own domain).

## 5. The frozen contract - the observe stamps (hook-dsh-workspace-observe)

### 5.1 The role

The first step of the invisible flow: on `fs/observed`, record the
observation stamp (the path, the observed version, the origin, the monotonic
sequence) in the hook's own KV domain. The conversation never sees the
stamps; a later wave's events surface them. The hook reads the event only -
it never reads file content and never writes a file.

### 5.2 The event contract (verified)

`ctx.root.on("fs/observed", (target: FsTarget, observation: FsObservation,
actor: object | undefined) => void)` - the exact registration the factory's
Wire uses (read
`Classic/packages/plugin-dsh-factory/Source/Function/Wire.ts`). Register on
the ROOT context, not the plugin context. The listener is a synchronous
recorder: no awaits, no throws, no I/O. Confirm the `FsObservation` field
carrying the version by reading the installed `@deepseek-ai/dsh-fs` types
(node_modules/@deepseek-ai/dsh-fs) or the Event Inspect provider; if the
event does not carry a version, read the target's stat lazily in the
detached path (see 5.3) and record `version: "unknown"` only as a last
resort, stated in the report.

### 5.3 The record and the store

```ts
interface Stamp {
	path: string;
	version: string;
	origin: "fs/observed" | "manual";
	sequence: number;
}
```

- The latest stamp per path is the record keyed by the path in the domain
  named Config.domain (default `workspace_observe`); a bounded ring of the
  last Config.maxStamps stamps (default 1000) is kept under the meta record
  `__ring` (oldest dropped, the drop is ledgered).
- `sequence` is the plugin's own monotonic counter (persisted in the meta
  record); it is NEVER a wall clock (the family's no-real-timers rule).
- The listener enqueues the synchronous record only. If a fingerprint is
  needed it is NOT computed in W1 (the graph owns content hashes).

### 5.4 The service surface (`ctx.workspaceObserve`)

- `stamp(path: string): Stamp | undefined` - the latest stamp.
- `stamps(limit?: number): Stamp[]` - the ring, newest first.
- `async manual(path: string): Promise<Stamp>` - resolve through ctx.fs,
  stat for the version, record with origin `manual`, ledger.
- `statistics(): { paths: number; stamps: number; sequence: number }`

### 5.5 The recursion guard and the exclusions

- An event whose `actor` is the hook's own actor object is ignored (the
  identity check; ledger `observe: ignored <path> (own actor)`).
- A path matching Config.exclude is ignored (ledger
  `observe: ignored <path> (excluded)`).
- The listener never throws: a malformed event is caught, logged with
  `ctx.logger`, and ledgered as `observe: failed <path> (<reason>)`.

### 5.6 The Config (Schemastery, all volatile)

| Field      | Type            | Default                                   |
| ---------- | --------------- | ----------------------------------------- |
| enabled    | boolean         | false                                     |
| domain     | string          | "workspace_observe"                       |
| maxStamps  | number          | 1000                                      |
| include    | array of globs  | []                                        |
| exclude    | array of globs  | node_modules/**, **/Target/**, **/.git/** |

### 5.7 The ledger lines (module-owned, byte-stable)

```text
observe: activated (domain=<domain>)
observe: stamped <path> version <version> (<origin>)
observe: ignored <path> (<reason>)
observe: manual <path> version <version>
observe: capped <path> (maxStamps <n>)
observe: failed <path> (<reason>)
```

### 5.8 The W1 acceptance checks (the lane prints them)

- B1 the build exits 0 (the same command shape as A1).
- B2 the smoke folders print their README counts; total N >= 10.
- B3 the listener is registered on `ctx.root` for `fs/observed` (the fake
  captures the registration and the root identity).
- B4 an emitted event records a stamp with the event's version, the origin
  `fs/observed`, and a monotonically increasing sequence (two events ->
  sequence n, n+1; no wall clock).
- B5 the latest stamp per path overwrites; the ring caps at maxStamps and
  the cap is ledgered.
- B6 an excluded path is ignored with the byte-exact ledger line.
- B7 an own-actor event is ignored with the byte-exact ledger line.
- B8 the KV domain round-trips through the fake domain (latest + ring).
- B9 an invalid config fails loud at load.
- B10 the fake fs records ZERO `writeText` calls.

## 6. The report and the escalation

Every lane reports in this exact shape:

```text
TASK <task id> - <the package>
STATUS: done | partial | blocked
FILES: <the created/changed paths, one per line>
ARBITER: <the prepublishOnly result> | <the printed N PASS - <Name> per folder>
CHECKS: A1 <pass/fail> ... (or B1 ...)
RESIDUALS: <what is deferred, one line each - no silent gaps>
DECISIONS: <anything the Lead must decide>
READY-TO-COMMIT: <the exact files> / <the suggested commit message>
```

If the task cannot be completed, do not silently give up. End the report with
a section starting exactly with:

```text
ESCALATION: <the concrete reason>
```

The lane claims its Team task before writing and completes it before
reporting (the worker-strains rule 9: a report without a state transition
leaves the next lane blocked). The Lead verifies by the printed arbiter
results and read-only spot checks; a report is a claim, not evidence.

---

## 7. The W1 dispatch record

- 2026-10-22: the two W1 lanes dispatched on the user's route
  (cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / reasoningEffort low)
  as explicit-route subagents. The teammate spawner does not expose the
  route and defaults to the DeepSeek lane (verified with a probe teammate),
  so the lanes run as subagents while the Team board carries the tasks and
  the write scopes.
  - W1-A the graph: subagent 8080af03-be26-4ccc-8960-7edc1ad0ea71, task-1,
    write scope Classic/packages/plugin-dsh-workspace-graph/.
  - W1-B the observe: subagent 45e8949f-f6dd-40fe-a321-602baa7ce45c,
    task-2, write scope Classic/packages/hook-dsh-workspace-observe/.
- The Lead closes each task only after the printed arbiter and the
  read-only spot checks (the lane's report is a claim, not evidence).
