---
title: The Search-Suggester Plugin - the intent-indexed target plan
category: Plans
kind: queued-plan
date: 2026-10-21
status: implemented (PoC)
registry: Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the research (the session evidence and the cost)
      state: resolved
      evidence:
          2,658 tool calls across this session and its 16 subagents; 1,223 search-class; 394
          workspace sessions and 33,834 calls scanned; the release lane 46 grep / 165 read / 143
          targets
    - name: the general model relation (the pattern graph and the Searchable instance)
      state: resolved
      evidence: Documentation/Plans/PATTERN-GRAPH-PLUGIN.md; this document, section 2
    - name: the intent model (Searchable<X>, the ten kinds, the algebra, the matching rules)
      state: resolved
      evidence: this document, section 3
    - name: the abstention boundary (the four patternize-able conditions)
      state: resolved
      evidence: this document, section 2.4
    - name: the deterministic classifier and the static repo index
      state: implemented (PoC)
      evidence:
          hook-dsh-search-suggester under Classic/packages/ (with its ets twin); the PoC-vs-plan
          grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the memory (the intent target index and the accept/reject journal)
      state: implemented (PoC)
      evidence:
          plugin-dsh-pattern as the pattern store; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the delivery (the additionalContexts note and the sticky section)
      state: implemented (PoC)
      evidence:
          the suggester delivery in the built hooks; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the learning (the offline seed and the online update)
      state: implemented (PoC)
      evidence:
          the record/decay in plugin-dsh-pattern; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the plural family (the core pattern service and the seven consumers)
      state: implemented (PoC)
      evidence:
          plugin-dsh-pattern + the seven suggester hooks under Classic/packages/; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name:
          the in-depth variants (the oracle, the graph query, the replay, the convention compiler,
          the planner)
      state: open
      evidence: section 9
    - name: the smokes and the replay benchmark
      state: open
      evidence: the nine suites and the harness in section 4.10; zero suites exist
    - name: the phases P0-P6
      state: open
      evidence: section 11
---

# SEARCH-SUGGESTER PLUGIN - the intent-indexed target plan

> The problem: an agent runs search after search because it does not know where the standard
> behavior lives. It greps for a version literal, then reads the files the grep found, then greps
> again for a different literal in the same intent, and only the edit reveals the files it never
> thought to open. The plugin infers the intent from the call and the recent context and names the
> likely targets BEFORE the model finishes searching. The user's formalism: `Searchable<X>`, where
> `X` is the task or intent. The general model is the pattern graph
> ([PATTERN-GRAPH-PLUGIN.md](./PATTERN-GRAPH-PLUGIN.md)): patternize-able behavior over graphs of
> files. The search suggester is its FIRST consumer and the evidence base; this document is the
> concrete, buildable instance, not a second general design. This document is a plan. Nothing is
> implemented; no package exists. The tree is at 0.1.0 (the release lane is complete).

## 0. The verdict

The premise is right, but the naive version of it is wrong.

- The searches are expensive: 46% of every tool call in this task's sessions is a search-class call
  (`grep`, `glob`, `read`, or a bash search), and the nine measured lanes produced about 1.0M tokens
  of tool results.
- The repetition is NOT mostly literal. Only 41 of the 394 recorded workspace sessions contain the
  same grep pattern twice. The real pattern is SEMANTIC: the same intent reached through a dozen
  different literals (`0.0.1`, `version|Version|release`, `0.1.0|semver`, `const Version`) and a
  hundred different paths.
- The model's discovery is late: in the release lane, 9 of the 143 files it eventually edited (6%)
  had been read before its first edit; in the overpass lane, 5 of 54 (9%). It did not read its way
  to the target set; it edited its way through it.
- Therefore the deliverable is not a better search. It is a TARGET SET: a compact, ordered,
  intent-keyed list of the standard locations, delivered at the first call of an intent, before the
  model has burned the searches.
- The target set is one instance of a general object: the behavior graph (Intent, Trigger, Target,
  Transform, Arbiter, Evidence). The search suggester carries the Trigger, the Target, and the
  Evidence, and its transform is the READ SET ("open these files") - deterministic and bounded. The
  EDIT transform belongs to the edit consumer; the Arbiter is exposed as a hint, never run. The
  pattern graph document states the general model, and section 2 states the boundary where this
  plugin must abstain instead of guessing.

The plugin is worth building, at one condition: it must be near-silent. A wrong target set costs
more than a missing one, because the model will follow it. The design below is built around that
asymmetry: high threshold, few candidates, a stated reason per candidate, a cooldown, an explicit
abstention path, and a kill criterion measured in section 10.

## 1. The evidence

### 1.1 The method

Every session record is a zstd-compressed JSONL event log:

```
~/.dsh/sessions/<workspace>/<session-id>/session.v4.jsonl.zstd
```

`zstd -dc` then parse the lines; `tool/call` carries `data.name` and `data.arguments` (a JSON
string), `tool/result` carries `data.message.toolCallId` and `data.message.content[].text`. A
search-class call is `grep`, `glob`, `read`, or a `bash` whose command contains `grep`, `rg `,
`find `, `ls `, `sed -n`, or `awk`. A repeat read is a second read of the same `file_path`; a repeat
grep is a second grep with the same `pattern`.

Scanned: all 394 sessions of this workspace (33,834 tool calls, 6,418 reads, 1,147 greps, 130
globs), then this session and its 16 subagents in detail (2,658 calls). The parent session was still
live at measurement time (2026-10-21T01:1x local), so its count is a floor.

### 1.2 The volume

| Lane                   | Calls | Grep | Glob | Read | Search | Repeat reads | Repeat greps | Targets | First edit | Targets read before |
| ---------------------- | ----- | ---- | ---- | ---- | ------ | ------------ | ------------ | ------- | ---------- | ------------------- |
| parent (orchestrator)  | 597   | 92   | 2    | 163  | 257    | 69           | 17           | 81      | call 74    | 15 (19%)            |
| release (version bump) | 469   | 46   | 0    | 165  | 211    | 12           | 33           | 143     | call 63    | 9 (6%)              |
| overpass (guard fix)   | 437   | 58   | 0    | 101  | 159    | 12           | 40           | 54      | call 48    | 5 (9%)              |
| site-totals            | 202   | 45   | 0    | 60   | 105    | 31           | 12           | 23      | call 46    | 13 (57%)            |
| plan-edits             | 127   | 55   | 0    | 31   | 86     | 3            | 22           | 0       | -          | -                   |
| ets (path rename)      | 128   | 14   | 1    | 41   | 56     | 12           | 1            | 23      | call 10    | 5 (22%)             |
| red-team               | 109   | 34   | 0    | 31   | 65     | 11           | 1            | 0       | -          | -                   |
| site-content           | 57    | 0    | 0    | 31   | 31     | 7            | 0            | 0       | -          | -                   |
| package-paths          | 52    | 2    | 0    | 17   | 19     | 0            | 0            | 16      | -          | -                   |
| 7 more audit lanes     | 380   | 30   | 10   | 140  | 180    | 10           | 2            | 0       | -          | -                   |

Totals: 2,658 calls, 1,223 search-class (46%), 162 repeat reads, about 1.0M tokens of tool results
(4.0M characters at ~4 chars/token).

The three worst lanes are not the same intent:

- `release` (session `4f6e7976-d2fa-40cf-8e4c-684bab941790`): 30 of its 46 greps are the
  then-current version literal `0.0.1` (the tree is now at 0.1.0); 165 reads across 153 distinct
  files; 190 edits across 143 distinct targets in 17.5 minutes. It edited 38 `README.md`, 32
  `package.json`, 30 `CONTRIBUTING.md`/`SCHEME.md`, 14 `Site/**`, 11 `Documentation/**`, 10 smoke
  `Test.ts`, 6 `Source/Function/Apply.ts` (the `const Version`), `CHANGELOG.md`, and
  `.github/workflows/NPM.yml`.
- `overpass` (session `ebce681f-ef44-4340-81de-de05be54abfd`): 32 of its 58 greps are `error TS`, 40
  repeat greps, 101 reads, 34 minutes - the test/build intent, where the answer is the failing
  suite, not a file.
- `parent`: 12 greps of `^[0-9]+ PASS`, 69 repeat reads, 163 reads across 94 files - the "what is
  the current count/status" intent, which lives in the smokes' READMEs, the site content, and the
  plans.

### 1.3 The repetition, corrected

Literal repetition is rare: 41 of 394 sessions have one repeated grep pattern. The two big
exceptions are the release lane (30x the version literal) and the overpass lane (32x `error TS`),
and both are single-intent sessions.

Semantic repetition is the rule. The workspace's 1,147 greps resolve into a keyword-classified floor
of: Test 92, Version 82, Usage 58, Symbol 46, Config 44, Ledger 35, Path 35, Owner 33, Dependency
33, Doc 27; the remaining 666 are repo-specific literals (CSS tokens, identifiers, prose fragments)
that a static rule set cannot name and a learned index can.

### 1.4 The sequences

The pipeline is stable and it is `grep -> read -> edit`, with the read doing the verification and
the edit doing the discovery:

- Read-before-edit holds: 182/186 edits in `release`, 125/130 in the parent, 50/53 in `site-totals`
  were preceded by a read of the same file. The suggestion must never replace the read; it must aim
  it.
- Grep-to-read adjacency is 1-2 calls: the grep names files, the read opens one or two, the edit
  follows. The model rarely reads the whole match list.
- The misses are the un-grepped families: the per-package `README.md`, `CONTRIBUTING.md`,
  `SCHEME.md` in the release lane were never found by a grep; they were found by a later, broader
  sweep (or by editing the manifest and noticing the sibling pattern).

### 1.5 The cost, in the units that matter

- Tokens: `release` 202k, parent 207k, `site-totals` 119k, `overpass` 138k. The read results
  dominate (118k of the parent's 207k); the grep results are 10-40k.
- Time: 17.5 min for the release lane, 34 min for overpass, 172 min for the parent's whole task.
- The suggestion's own cost: a 120-200 token note. If it removes even two reads of a 3k-token file,
  it pays for itself.

### 1.6 What the evidence does NOT show

- No counterfactual. We do not know that the model would have followed a suggestion; the acceptance
  rate is the first thing to measure, not to assume.
- One repo, one model family, one week of sessions. The corpus is not a benchmark.
- The release lane was TOLD the standard files in its prompt and still took 63 calls to its first
  edit. That is partly an instruction-following failure, not only a discovery failure. A suggestion
  helps the long tail (the 68 README/CONTRIBUTING/SCHEME files), less the head.
- The parent's 597 calls include orchestration (`subagent`, `list_agents`, `send_message`), not only
  search. The 46% search share is the honest number, not 80%.
- The `site-totals` lane reached 57% of its targets before its first edit, so the "6% discovery"
  figure is intent-dependent, not universal.

## 2. The general model: the pattern graph

The general design lives in [PATTERN-GRAPH-PLUGIN.md](./PATTERN-GRAPH-PLUGIN.md). This section
restates only what the search consumer must obey; the full model, the family roster, and the phases
are there.

### 2.1 The four patternize-able conditions

A behavior is patternize-able when ALL FOUR hold:

1. An **observable trigger** - something in the live context signals the behavior (a tool call, a
   file state, the user's words).
2. A **target subgraph** - a repeatable set of files, code blocks, symbols, or documents, connected
   by the file graph.
3. A **deterministic transform** - the edits are mechanical given the target.
4. An **arbiter** - the behavior has a verification (the build, a smoke, the site build, the Drift).

If any one is missing, the plugin abstains. The search suggester's special case: the behavior it
patterns is LOCATE, not EDIT. Its transform is the read set ("open these files"), which is
deterministic and bounded; the edit that follows is the edit consumer's transform, and the search
consumer never claims it. That is why this plugin is a READ-ONLY suggester and never an editor: it
can name the target subgraph and point at the arbiter, but it cannot claim that the change is
mechanical. The moment a suggestion would have to decide the edit, the pattern is out of scope and
the plugin abstains.

### 2.2 The behavior graph

| Node      | Carries                            | The search consumer's value                                                                |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Intent    | the task kind and its parameters   | `Version(family, 0.1.0 -> 0.1.1)`                                                          |
| Trigger   | the signals that identify it       | a grep for the version literal, or a read of a manifest                                    |
| Target    | a subgraph of the file graph       | the manifests, the `const Version`, the CHANGELOG, the site Content, the per-package prose |
| Transform | the edit operations, ordered       | NOT supplied by this plugin - the model's                                                  |
| Arbiter   | the verification                   | the aggregate, the site build, the Drift                                                   |
| Evidence  | the session traces that support it | the recorded lanes in section 1                                                            |

The edges: `matches` (Trigger -> Intent), `targets` (Intent -> Target), `applies` (Intent ->
Transform), `verifies` (Intent -> Arbiter), `supports` (Evidence -> Intent and Evidence -> Target),
`precedes` (Intent -> Intent).

A pattern type is a parameterized subgraph:
`Pattern<X> = Trigger<X> x TargetGraph<X> x Transform<X>* x Arbiter<X>`. The search consumer
implements the `Searchable<X>` specialization in section 3: it fills Trigger, Target, and Evidence,
and it exposes the Arbiter as a hint ("the aggregate, the site build, the Drift") without running
it.

### 2.3 The algebra

- **Composition**: a release is `VersionBump` then `Changelog` then `SiteFigures` then `Publish`;
  the search suggester sees the first component and can name the next one through the `precedes`
  edge (the next-step planner, section 9.5).
- **Sequence**: a rename is `SymbolRewrite` then `TestUpdates` then `DocUpdates`; the search
  suggester's Path and Symbol intents carry the sequence as an ordered candidate list, not as an
  execution plan.
- **Parameterization**: the same `VersionBump` pattern applies to any package; the parameters are
  the package set and the version. The candidate list is generated from the parameters, never
  hard-coded per package.
- **Abstention**: a match below the threshold yields the empty suggestion, not a guess. The
  algebra's identity element is silence.

### 2.4 The abstention boundary

The plugin abstains when ANY of these holds:

1. **The confidence is below the threshold.** Default 0.75; the destructive intents (Version, Path,
   Ledger) require 0.85.
2. **The target subgraph is empty or ambiguous.** Two patterns match equally, or the index has no
   candidate for the intent.
3. **The behavior is novel.** No static pattern and no evidence in the learned registry.
4. **The request is exploratory.** The user or the goal says "figure out why", "investigate",
   "research", "compare", "decide" - the intent is a question, not a pattern.
5. **The suggestion would repeat one already given and ignored.** The cooldown and the dismissal
   path; a repeated ignored suggestion is noise.

The search-specific abstentions, in addition:

- The grep is inside `node_modules`, `Target`, `.git`, or a lockfile and the intent is not
  Dependency.
- The candidate set is already fully read in the ring buffer (nothing to add).
- The call is the first of a turn and the user's message is a question with no action verb (the
  model is answering, not modifying).
- The session is a subagent with a read-only spec (the suggester can still emit, but the threshold
  rises by 0.1 - a read-only lane is cheaper to leave alone).

Every abstention is a ledger line (`search-suggester: abstained <reason> <X> <k>`), so the precision
is measured, not assumed.

### 2.5 The learner

The general learner in the pattern graph document: sessions -> frequent subgraphs -> the registry.
The search consumer's version is section 6: the same corpus, a narrower label (the ten intent
kinds), a narrower subgraph (the target set per intent), and the same refresh discipline (offline
seed, online accept/reject, decay).

The division of labor:

- The CORE learner (the pattern service) mines the frequent `search -> read -> edit -> verify`
  subgraphs across all domains.
- The SEARCH learner (this consumer) labels the search subgraph with the intent and the target set,
  and measures the suggestion's effect.
- The core's registry is the superset; the search pack is one projection of it.

### 2.6 `Searchable<X>` as the first instance

`Searchable<X>` is the search consumer's name for the pattern: `X` is the intent, the trigger is the
search tool call, the target is the subgraph where `X` usually lives, the transform is the read set
(the deterministic "open these"), the arbiter is the eventual build/test. The edit that follows is
the edit consumer's transform, not this one's. The next section defines `Searchable<X>` fully. The
other consumers (section 8) are the same shape with a different trigger and a different target.

## 3. The intent model: `Searchable<X>`

### 3.1 The definition

```
Searchable<X> = <X, P, S, E, C, k>

  X : IntentKind                  the task the model is actually doing
  P : Pattern                     the call-shape predicate that opens it
  S : Scope                       the roots and extensions the answer can live in
  E : Evidence[]                  the observed signals, each weighted
  C : Candidate[]                 the ordered target set (path or glob + reason)
  k : Confidence                  [0,1], the combined score
```

Two functions and one algebra:

```
detect : Call x Ring x Context x Index -> Option<<X, E>>
resolve: <X, E> x Index x Memory       -> Searchable<X>

union      S1 + S2 = <X*, C1 u C2 by path (max score), max(k)>
restrict   S|T     = S with C limited to the subtree T
suppress   S - M   = S with the candidates dismissed in M removed
emit(S)            = S iff k >= theta and C != empty and not cooled(X)
                     and not deduped(X, C)
```

`X*` is the higher-priority intent when two fire on one call (the order in 3.2). The algebra is
deliberately small: a union, a restriction, a suppression, and a gate. Anything larger (a planner, a
ranker, an LLM) moves the cost into the hot path, which this design forbids.

### 3.2 The ten intent kinds

Ordered by priority (destructive first: a wrong Version is costlier than a wrong Usage).

| X          | The question the model is asking | The trigger shape                                                  |
| ---------- | -------------------------------- | ------------------------------------------------------------------ |
| Version    | "where does the version live"    | a semver literal, a `version`/`release`/`bump` word                |
| Path       | "where does this path come from" | an absolute path, a `~/.dsh` default, a move/rename                |
| Ledger     | "what does the log line say"     | `logFile`, `.log`, `journal`, `ledger`, `activated (`              |
| Config     | "where is this knob"             | a knob name, `Schema.`, `cordis`, `volatile`                       |
| Dependency | "who depends on this"            | a package name, `peerDependencies`, `pnpm`, `install`              |
| Test       | "which suite proves it"          | `PASS`, `FAIL`, `error TS`, `assert`, `suite`, a count             |
| Symbol     | "where is this defined"          | `const`, `export`, `function`, `class`, `interface`, an identifier |
| Doc        | "which document owns it"         | a heading, `title:`, `status:`, `README`, `Documentation`          |
| Usage      | "who uses this"                  | a plugin name, `hook-dsh-`, an import                              |
| Owner      | "who owns this"                  | `Handoff`, `Brand`, `CONTRIBUTING`, a package identity             |

### 3.3 The pattern `P`

A pattern is a predicate with a strength, not a boolean:

```
P(call) = (name, args) -> [(rule, strength)]
```

- `grep`: the `pattern` string, the `path`, the `include`. A semver literal is a strong Version
  signal (0.5); the word `version` in a non-semver pattern is weaker (0.3).
- `glob`: the `pattern` string. `**/package.json` is Version + Dependency; `**/*.test.ts` is Test.
- `read`: the `file_path` only. A manifest is Version; a `Test.ts` is Test; `Documentation/**/*.md`
  is Doc; a `Source/Function/Apply.ts` is Version + Ledger + Config (all three live there).
- `bash`: only when the command is a search (`grep`, `rg`, `find`, `sed -n`, `ls`). The command is
  tokenized and the first search-shaped segment is classified.
- `edit` / `write`: the `file_path` only, and only for the LEARNING signal (3.8, R14), never to emit
  a note - a note after the edit is too late.

### 3.4 The scope `S`

```
S = <root, include[], exclude[]>
```

The default root is the session workspace. The exclusions are load-bearing: `node_modules`,
`Target`, `.git`, `Site/Target`, `dist`. A grep restricted to `pnpm-lock.yaml` is Dependency, not
Version, because the scope overrides the literal. A read under `Documentation/` is Doc first, even
if the file contains a version.

### 3.5 The evidence `E`

| Signal        | Weight | Example                                                   |
| ------------- | ------ | --------------------------------------------------------- |
| literal shape | 0.5    | `\b\d+\.\d+\.\d+\b` in the grep pattern                   |
| path shape    | 0.4    | `read` of `package.json`                                  |
| context word  | 0.3    | the user message says "bump" or "rename"                  |
| sequence      | 0.2    | the same intent in 2 of the last 4 calls, no edit between |
| index hit     | 0.3    | the candidate is a canonical location in the static index |
| history       | 0.2    | the candidate was followed in past sessions               |
| negative      | -0.4   | the candidate was dismissed or ignored twice              |

`k = sigmoid(sum(w_i * e_i) + b)`, with `b = -0.6` so that a single weak signal does not cross the
default threshold. The weights are config, not constants, so the replay can tune them without a
rebuild.

### 3.6 The candidates `C`

This is the part the repo already knows and the model does not. Per intent, the standard target set,
as literal paths or globs:

**Version**

```
package.json (root)                      the monorepo manifest
Site/package.json                        the site manifest
Classic/packages/*/package.json          the 15 Classic manifests
EffectTS/packages/*/package.json         the 16 EffectTS manifests
Classic/packages/*/Source/Function/Apply.ts      the const Version (ccr, tool-coach, live-containers)
EffectTS/packages/*/Source/Function/Apply.ts     the same, EffectTS twins
Site/Source/Library/Content.ts           Versions.Release (line 81)
Site/Source/Library/Live.ts              the live overlay
CHANGELOG.md                             the new section
README.md                                the badge and the prose
Documentation/Plugins/PLUGIN-FAMILY.md   the roster versions
Documentation/Guides/DSH-REGISTRY-LISTING.md
Documentation/Plans/TRUSTED-PUBLISHER.md
Documentation/FRAMEWORK.md
Site/Source/pages/versions.astro
Site/Source/pages/setup.astro
Site/Source/Component/Configurator.astro
.github/workflows/NPM.yml                the publish trigger
Classic/smokes/Test/Introspection/Live-Assertions/{Test.ts,Test.mjs,README.md}
EffectTS/smokes/Test/Introspection/Live-Assertions/{Test.ts,Test.mjs,README.md}
**/README.md, **/CONTRIBUTING.md, **/SCHEME.md   the long tail (68 files in the release lane)
```

**Symbol**: `Source/Library.ts` (the entry; the only named exports), `Source/Function/*.ts` (one
definition per file), `Source/Interface/*.ts`, `Source/Variable/*.ts`, `Source/Test/<Suite>/Test.ts`
(the assertion), `Target/**` (the build mirror - a suggestion must say "never edit"),
`Documentation/Skill/*/references/*.md` (the prose twin).

**Config**: `Source/Variable/Config.ts` (the schema default), `Source/Interface/Config.ts` (the
shape), `cordis.patch.yml` (the row and the config block), `README.md` (the Config section),
`SCHEME.md` (the full table), `Site/Source/Component/Configurator.astro` and the plugin page,
`Source/Test/Config-And-Activation/{Test.ts,README.md}`, `Source/Function/Apply.ts` (the State
fields map).

**Test**: `Source/Test/<Suite>/{Test.ts,README.md}`, `Classic/smokes/Test/**`,
`EffectTS/smokes/Test/**`, `Maintain/Run-Smokes.mjs`, `Maintain/Run-Wiring.mjs`,
`Classic/smokes/README.md`, the README badge, the site counts.

**Doc**: `Documentation/INDEX.md`, the document's own frontmatter and body,
`Documentation/ARCHIVE-STYLE.md`, the hub, the cross-references, `Site/Source/Content/**`,
`Site/Source/pages/**`, `README.md`.

**Dependency**: every `package.json` (`dependencies`, `devDependencies`, `peerDependencies`),
`pnpm-lock.yaml`, `pnpm-workspace.yaml`, the factory's peer list, the install line in `README.md`
and `Site/Source/pages/setup.astro`, the smokes' install assertions.

**Path**: `Source/Variable/Config.ts` (the `logFile` default), `cordis.patch.yml` (the same value),
`README.md` (the "One ledger per plugin" prose), `SCHEME.md`, the smoke's byte-exact path assertion,
`Site/Source/pages/plugins/*.astro`, the plans that quote the path.

**Usage**: `Documentation/Plugins/PLUGIN-FAMILY.md`, `Site/Source/pages/plugins.astro` and
`Site/Source/pages/plugins/<name>.astro`, `README.md`,
`Documentation/Skill/session-orientation/references/repository-map.md`,
`Documentation/Skill/plugin-system/references/inventory.md`.

**Owner**: `Documentation/Handoff/**`, `Documentation/Brand/BRANDING.md`, `.github/**`,
`CONTRIBUTING.md`, the module's own ledger strings,
`Documentation/Plans/FAMILY-ORGANISATION-ANALYSIS.md`.

**Ledger**: the module's `Source/Function/Apply.ts` (the activation line),
`Source/Function/Verify.ts` and `Settle.ts` (the chain lines), `Source/Variable/Config.ts` (the
`logFile` default), `cordis.patch.yml`, the smoke's byte-exact assertion, `README.md`, `SCHEME.md`,
and the runtime artifact `~/.dsh/<identity>.log` (never a repo edit).

A candidate is `{path|glob, kind, prior, reason}`. The `reason` is the one phrase the model reads:
"canonical location", "the schema default", "the byte-exact assertion", "the build mirror - never
edit". A candidate without a reason is not emitted.

### 3.7 The confidence `k`

```
score(c) = 0.35*scope(c) + 0.25*prior(c) + 0.25*literal(c)
         + 0.15*history(c) - 0.20*recent(c)

scope(c)   = 1.0 exact in scope, 0.7 in-scope glob, 0.3 out of scope
prior(c)   = 1.0 canonical, 0.6 family, 0.3 fallback
literal(c) = 1.0 if the index digest proves the literal occurs in c
history(c) = Laplace rate (followed+1)/(count+2)
recent(c)  = 1.0 if c was suggested in the last cooldown calls
```

The candidate list is sorted by `score`, capped at `maxCandidates` (7), and the `k` of the whole
suggestion is the `k` of the intent, not the sum of the candidates.

### 3.8 The matching rules (ordered)

- R1 literal-shape: a semver literal in the grep pattern or the bash grep argument -> Version (0.5).
- R2 manifest-shape: a read or edit of `package.json` -> Version (0.4), Dependency (0.3), Config
  (0.2).
- R3 test-shape: `PASS|FAIL|error TS|assert|suite|checks run` -> Test.
- R4 ledger-shape: `logFile|\.log\b|journal|ledger|activated \(` -> Ledger.
- R5 path-shape: `/Users/|/Volumes/|~/.dsh|Source/.*\.ts` -> Path.
- R6 symbol-shape: `const |export |function |class |interface |\bId\b` -> Symbol.
- R7 config-shape: `threshold|enabled|volatile|Schema\.|cordis` -> Config.
- R8 doc-shape: `^#|title:|status:|kind:|README|Documentation` -> Doc.
- R9 dep-shape: `"effect"|npm install|peerDependencies|pnpm` -> Dependency.
- R10 usage-shape: a plugin name or `hook-dsh-` -> Usage.
- R11 owner-shape: `Handoff|Brand|owner|CONTRIBUTING` -> Owner.
- R12 context: the user message or the goal objective contains
  `bump|release|rename|move|config|docs|test` -> +0.3 to that intent.
- R13 loop: the same intent detected in 2 of the last 4 calls with no edit between -> +0.2 (the
  model is searching in circles).
- R14 miss: the last suggestion's candidates were not read within `learnWindow` calls ->
  `history(c) -= 0.2` for the untouched ones; the candidate the model chose instead gets `+0.2` (the
  near-miss rule).

A call may satisfy several rules; the highest-priority intent wins the note, and the second intent
is folded into the same note only if its `k` is within 0.1 (one note, two intents, one target list).

### 3.9 Worked example

A grep for `0.1.0` (the current version) at call 13 of a bump lane, scope repo, the user message
saying "bump to 0.1.1":

- R1 fires (0.5), R12 fires (0.3), the index has the canonical Version set (0.3) ->
  `k = sigmoid(1.1-0.6) = 0.62`, below the 0.75 default.
- The second grep for a variant literal (`0\.1\.0|semver`) adds the loop signal (0.2) ->
  `k = sigmoid(1.3-0.6) = 0.67`.
- The third grep, or a read of `package.json` (R2, 0.4) -> `k = 0.80`, the note emits at call 15
  instead of the model's 63rd call.
- The note names 9 candidate families covering 142 of the 143 eventual targets (99%); the one miss
  is the `.github/workflows/NPM.yml`, which the glob `**/*.yml` would also catch.

That is the whole value proposition: one note at call 15 instead of 48 search calls before the first
edit.

## 4. The architecture

### 4.1 The archetype

A HOOK, not a service plugin - for now. It has no public API, no store the other plugins read, and
no lifecycle of its own beyond a ledger and a JSON file. The loader contract is the family's:
`name`, `apply`, `Config`, `inject: ["pluginFactory"]` (the State builder and the ledger only; no
`tools` needed unless the optional query tool ships).

The package name: `@playform/hook-dsh-search-suggester` in Classic,
`@playform/ets-hook-dsh-search-suggester` in EffectTS. The bundle patch row is
`insert: - id: search-suggester`.

The core (`plugin-dsh-pattern`, section 8) is the service the plural family shares; the search
consumer ships first as a standalone hook so that the evidence arrives before the extraction. The
family's two-consumer extraction rule applies: the core is extracted only after the search consumer
and ONE other consumer exist.

### 4.2 The surfaces

| Surface                  | Mode                          | What it does                                                                                                                                    |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute`     | waterfall, plain registration | the note: `next()` first, then detect, resolve, gate, and prepend one `additionalContexts` message to the downstream decision                   |
| `agent/pre-step`         | waterfall                     | the per-turn reset: the ring buffer, the cooldown counters, the dedupe set; optionally the sticky-intent injection when `sectionMode: "sticky"` |
| `system-prompt/assemble` | waterfall, after `next()`     | the optional sticky section: the intent catalog for the current task, rebuilt on a TTL and invalidated on `tools/change`                        |
| `tools/pre-execute`      | waterfall                     | NOT used. A suggestion cannot rewrite arguments (the contract excludes input rewriting), and a deny would be a coach, not a suggester           |
| `tools/change`           | emit                          | the section-cache invalidation only                                                                                                             |

The post-execute listener runs AFTER the ccr's `{prepend: true}` listener and after the normalize
family's post-execute (plain registration order), and it never replaces content: it only adds
`additionalContexts`, so a ccr-compressed result is unaffected. The note's message source is the
plugin's own kind, declared by declaration merging:

```ts
declare module "@deepseek-ai/dsh-llm" {
	interface MessageSourceMap {
		"search-suggester": {
			readonly kind: "search-suggester";
			readonly form: "notice";
			readonly summary: string; // <= 120 chars, boundContextSummary
		};
	}
}
```

The label is load-bearing, exactly as the tool-coach's is: an unlabeled context renders as a user
prompt in derived history.

### 4.3 The deterministic classifier

No LLM in the hot path. The classifier is a pure function over:

```
(name, args, ring[8], userText, goalText, index, memory) -> Searchable<X> | null
```

- `ring` is the last 8 tool calls (name + path/pattern + outcome), held in a per-agent `WeakMap`
  keyed on the Agent object (the tool-coach precedent), reset on `agent/pre-step` when a user
  message enters.
- The rules are regexes and path predicates, compiled once at apply.
- The cost is O(10 intents x ~6 rules) plus a map lookup; no I/O, no allocation beyond the note.
  Target: under 1 ms per call, measured in the smoke.
- The index is loaded once at apply (a JSON read on the boot path, not the hot path) and held as a
  frozen object.
- The memory write (the journal) is a detached append through `ctx.jobs.start` or a buffered flush
  at the next pre-step; the hot path never awaits a disk write.

### 4.4 The static repo index

Generated, never hand-written: `Maintain/Index-Search-Targets.mjs` walks the repo (excluding
`node_modules`, `Target`, `.git`, `Site/Target`) and emits:

```json
{
	"schema": 1,
	"fingerprint": "<git HEAD short>:<mtime-sum>:<file-count>",
	"builtAt": 1792534226,
	"files": 7322,
	"intents": {
		"Version": {
			"targets": [
				{
					"path": "package.json",
					"kind": "manifest",
					"prior": 1.0,
					"digest": "version",
					"reason": "the monorepo manifest"
				},
				{
					"path": "Site/Source/Library/Content.ts",
					"kind": "literal",
					"prior": 1.0,
					"digest": "Versions.Release",
					"reason": "the site release constant"
				}
			]
		}
	}
}
```

The `digest` is a short literal the generator verified in the file (for example `const Version`,
`Versions.Release`, `logFile`); it is the `literal(c)` input. The generator also records the family
globs (`**/README.md`, `**/CONTRIBUTING.md`, `**/SCHEME.md`) with a `family: true` flag and a count.
The index is written to `~/.dsh/search-suggester/index.json` (never the repo) and regenerated on
boot when the fingerprint differs, or on demand through the optional tool.

### 4.5 The learned knowledge base

See section 5. The classifier reads it; the learner writes it; the index generator seeds it.

### 4.6 The delivery

Two channels, one default:

1. The note (default): one `additionalContexts` message on the post-execute decision, prepended, at
   most `maxNoteChars` (1200), at most `maxCandidates` (7) targets, with the intent, the confidence,
   and the reason per target.
2. The sticky section (opt-in, `sectionMode: "sticky"`): one `system-prompt/assemble` section
   carrying the current intent's target list, rebuilt when the intent changes or the TTL elapses. It
   costs tokens on every request, so it is off by default and recommended only for long
   single-intent tasks (the version bump, the rename).

The note is never appended to the tool result content. It is a separate message, so it survives the
ccr and cannot be mistaken for file content.

### 4.7 The noise control

- Confidence gate: `k >= threshold` (default 0.75).
- Cooldown: no second note for the same intent within `cooldownCalls` (default 6) judged calls, per
  agent.
- Dedupe: the same intent + the same candidate set within a turn is one note; a candidate already
  read in the ring is dropped from the list.
- Cap: `maxNotesPerTurn` (default 3), so a busy turn cannot drown in notices.
- Dismiss: an explicit `search_suggester` tool (opt-in) with `verdict: "dismiss"` and an optional
  path; the dismissal is remembered for the session and down-weights the path. Without the tool, the
  implicit signal (no candidate read within `learnWindow`) is the only feedback.
- Fail-open: any classifier error logs a warning and returns the downstream decision unchanged. A
  note never fails a tool call.

### 4.8 The config

```ts
Compose(false, {
	logFile: Schema.string().default("~/.dsh/search-suggester.log").volatile(),
	enabled: Schema.boolean().default(true).volatile(),
	threshold: Schema.number().default(0.75).volatile(),
	maxCandidates: Schema.number().default(7).volatile(),
	maxNoteChars: Schema.number().default(1200).volatile(),
	cooldownCalls: Schema.number().default(6).volatile(),
	maxNotesPerTurn: Schema.number().default(3).volatile(),
	intents: Schema.array(Schema.string())
		.default([
			"Version",
			"Path",
			"Ledger",
			"Config",
			"Dependency",
			"Test",
			"Symbol",
			"Doc",
			"Usage",
			"Owner",
		])
		.volatile(),
	emitOn: Schema.array(Schema.string()).default(["grep", "glob", "read", "bash"]).volatile(),
	scopeRoots: Schema.array(Schema.string()).default(["."]).volatile(),
	exclude: Schema.array(Schema.string())
		.default(["node_modules", "Target", ".git", "Site/Target", "dist"])
		.volatile(),
	learn: Schema.boolean().default(true).volatile(),
	learnWindow: Schema.number().default(2).volatile(),
	persistPath: Schema.string().default("~/.dsh/search-suggester/knowledge.json").volatile(),
	indexPath: Schema.string().default("~/.dsh/search-suggester/index.json").volatile(),
	refreshOnBoot: Schema.boolean().default(true).volatile(),
	sectionMode: Schema.union(["off", "sticky"]).default("off").volatile(),
	sectionTtl: Schema.number().default(20).volatile(),
});
```

Every knob is volatile (hot-editable without a remount), matching the tool-coach's posture. The
structural knobs (`persistPath`, `indexPath`) remount on edit.

### 4.9 The ledger

One ledger per module, `~/.dsh/search-suggester.log`, byte-exact strings:

```
search-suggester: activated (bundle 0.1.0, intents 10, threshold 0.75)
search-suggester: disabled (enabled=false)
search-suggester: suggest Version 0.93 9 candidates call <id>
search-suggester: abstained low-confidence Version 0.62
search-suggester: abstained ambiguous Target 0.71
search-suggester: suppressed cooldown Version
search-suggester: suppressed dedupe Version
search-suggester: followed Version Site/Source/Library/Content.ts
search-suggester: ignored Version
search-suggester: dismissed Version pnpm-lock.yaml
search-suggester: index refreshed (fingerprint <12hex>, files 36, targets 214)
search-suggester: index stale (fingerprint <a> != <b>)
search-suggester: index rebuild failed <reason>
```

The activation line uses the core's `Activate` composer and the module's own field list. The smokes
assert each string byte-identically.

### 4.10 The smokes

Nine suites under `Source/Test/`, one folder each, `Test.ts` + `README.md`, run standalone and by
`Maintain/Run-Smokes.mjs`:

1. `Classification` - the rule table: one case per intent, the priority order, the scope override (a
   lockfile grep is Dependency).
2. `Threshold-And-Cooldown` - the gate arithmetic, the cooldown, the dedupe, the per-turn cap.
3. `Delivery-And-Label` - the `additionalContexts` message, the `{kind, form, summary}` label, the
   120-char bound, the pass-through when `k < threshold`.
4. `Abstention` - the five general gates and the four search-specific ones; the ledger line per
   abstention; the empty suggestion.
5. `Learning-Update` - the follow/ignore/miss rules, the Laplace rate, the decay, the near-miss.
6. `Persistence` - the JSON schema, the atomic write, the corruption fallback to the static index,
   the 0600 mode.
7. `Index-Refresh` - the fingerprint change, the rebuild, the stale line.
8. `Noise` - 20 legitimate calls produce zero notes (the vacuous-green trap avoided: the harness
   asserts the note count is exactly zero, not merely "no error").
9. `Ledger` - every line above byte-exact.

Plus one integration fixture: a recorded 50-call sequence from the release lane, replayed through
the real built `Target/Library.js` with a fake context, asserting the note at call 15 and the
candidate set.

## 5. The memory

### 5.1 What is persisted

Two files under `~/.dsh/search-suggester/`, never the repo:

- `index.json` - the static index (section 4.4), regenerated from the repo; it is a cache, not
  knowledge.
- `knowledge.json` - the learned state: the per-intent target counts, the accept/reject journal, the
  dismissals, the stats.

### 5.2 The schema

```json
{
	"schema": 1,
	"fingerprint": "b51fe2c:1697812345:7322",
	"builtAt": 1792534226,
	"intents": {
		"Version": {
			"targets": [
				{
					"path": "package.json",
					"kind": "manifest",
					"prior": 1.0,
					"count": 12,
					"followed": 9,
					"lastSeen": 1792534000
				},
				{
					"path": "Site/Source/Library/Content.ts",
					"kind": "literal",
					"prior": 1.0,
					"count": 4,
					"followed": 4,
					"lastSeen": 1792534100
				}
			]
		}
	},
	"journal": [
		{
			"id": "sug-1a2b",
			"intent": "Version",
			"call": "chatcmpl-...",
			"at": 1792534226,
			"kappa": 0.93,
			"candidates": ["package.json", "Site/Source/Library/Content.ts"],
			"outcome": "followed",
			"followedBy": "Site/Source/Library/Content.ts"
		}
	],
	"dismissals": [{ "intent": "Version", "path": "pnpm-lock.yaml", "until": 1792535000 }],
	"stats": { "emitted": 0, "followed": 0, "ignored": 0, "dismissed": 0 }
}
```

### 5.3 The refresh

- Boot: if `refreshOnBoot` and the index fingerprint differs from the repo's current fingerprint
  (git HEAD + the mtime sum + the file count), rebuild the index, keep the knowledge, log the
  refresh line.
- A rebuild failure keeps the old index and logs the failure; the plugin degrades to the static
  defaults, never to no suggestions.
- The knowledge file is written atomically (write a temp, rename), 0600, and bounded: the journal
  keeps the last 2,000 entries (a ring), the targets keep the top 200 per intent by count.

### 5.4 The privacy

- Paths are repo-relative; no absolute home paths, no file contents, no user text, no prompts, no
  model output.
- The journal records the intent, the candidate paths, the confidence, and the outcome - nothing
  that reveals what the file said.
- The note itself quotes only paths and one reason phrase; it never quotes a line of code or a
  document.
- A `--reset` (or deleting the directory) erases everything; the plugin rebuilds from the index on
  the next boot.
- The offline learner reads the session transcripts ONLY when explicitly run by the user; it is a
  Maintain script, not a plugin behavior.

## 6. The learning

### 6.1 Offline (the seed)

`Maintain/Learn-Search-Intents.mjs` (a local, opt-in script):

1. Read the session JSONL (the same parse as section 1.1).
2. For each search-class call, run the classifier to get the intent and the candidates it WOULD have
   suggested.
3. For each session, compute the eventual target set: the files edited in the same turn, plus the
   files read within the next 20 calls.
4. Attribute each target to the intent of the nearest preceding search call; count the hits per
   candidate.
5. Write the seed counts into `knowledge.json` (a `seed: true` marker so the online learning can
   outvote it).

The seed is how the index learns the repo-specific long tail (the 68 README/CONTRIBUTING/SCHEME
files, the site pages, the smokes). It is also the replay benchmark's ground truth.

The same corpus feeds the CORE learner (the pattern graph document, section 3): the frequent
`search -> read -> edit -> verify` subgraphs become candidate patterns in the shared registry. The
search consumer's seed is one projection of that registry.

### 6.2 Online (the signal)

The learner watches the calls AFTER a note, within `learnWindow` (2) calls:

- `followed`: a candidate path is read or edited -> `count += 1`, `followed += 1`, the journal
  outcome `followed`.
- `ignored`: no candidate touched, and the model continues searching the same intent ->
  `count += 1`, outcome `ignored`, `history(c) -= 0.2` for the untouched candidates.
- `near-miss`: the model reads or edits a path that was NOT a candidate -> that path gets
  `count += 1`, `followed += 1` (the index missed it), and the untouched candidates get the
  `ignored` penalty.
- `dismissed`: an explicit dismissal -> the path is excluded for the session, and the intent's
  threshold is raised by 0.05 for the session (the user is telling us the intent is wrong, not the
  path).

### 6.3 The update rule

```
rate(c)  = (followed + 1) / (count + 2)          Laplace
prior(c) = clamp(prior(c) * 0.98 + rate(c) * 0.02, 0.3, 1.0)
score    = 0.35*scope + 0.25*prior + 0.25*literal + 0.15*rate - 0.20*recent
```

The prior moves at most 2% per observation, so one bad session cannot poison the index; the rate
moves faster within a session (the short-term signal). A path whose `count` reaches 20 with
`rate < 0.2` is demoted to `prior 0.3` and eventually dropped from the emitted set (kept in the
journal).

### 6.4 The cold start

The static index alone is enough to emit: every canonical location has `prior 1.0`, and the first
session needs no history. The learned layer is an optimization, not a prerequisite. With
`learn: false`, the plugin is fully functional and deterministic.

## 7. The delivery format

### 7.1 The version bump

The trigger: `grep` for `0.1.0`, or a read of `package.json` during a bump. The note:

```
[search-suggester] intent=Version confidence=0.93 scope=repo
targets (9):
- package.json (36: root, Site, Classic/packages/*, EffectTS/packages/*) - the manifests
- */Source/Function/Apply.ts (6: ccr, tool-coach, live-containers x both trees) - the const Version
- Site/Source/Library/Content.ts - Versions.Release
- CHANGELOG.md - the new section
- README.md - the badge
- Documentation/Plugins/PLUGIN-FAMILY.md, Documentation/Guides/DSH-REGISTRY-LISTING.md, Documentation/Plans/TRUSTED-PUBLISHER.md - the roster prose
- Site/Source/pages/versions.astro, Site/Source/pages/setup.astro, Site/Source/Component/Configurator.astro
- .github/workflows/NPM.yml - the publish trigger
- **/README.md, **/CONTRIBUTING.md, **/SCHEME.md (68) - the long tail
note: pnpm-lock.yaml is Dependency, not Version; Target/ is generated, never edit it.
```

About 150 tokens. It names 142 of the release lane's 143 eventual targets.

### 7.2 The symbol search

The trigger: `grep` for `const Version` or a read of `Source/Function/Apply.ts`. The note:

```
[search-suggester] intent=Symbol confidence=0.88 scope=repo
targets (5):
- Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts - the definition (line 86)
- EffectTS/packages/ets-hook-dsh-ccr/Source/Function/Apply.ts - the twin
- Classic/packages/hook-dsh-ccr/Target/Function/Apply.js - the build mirror, never edit
- Classic/packages/hook-dsh-ccr/Source/Test/Config-And-Activation/Test.ts - the byte-exact assertion
- Classic/packages/hook-dsh-ccr/README.md, SCHEME.md - the prose
note: one definition per file; the Target mirror is regenerated by the build.
```

### 7.3 The config search

The trigger: `grep` for `logFile` or `threshold`. The note:

```
[search-suggester] intent=Config confidence=0.90 scope=repo
targets (6):
- Classic/packages/hook-dsh-ccr/Source/Variable/Config.ts - the schema default
- Classic/packages/hook-dsh-ccr/cordis.patch.yml - the row value
- Classic/packages/hook-dsh-ccr/README.md - the Config section
- Classic/packages/hook-dsh-ccr/SCHEME.md - the full table
- Classic/packages/hook-dsh-ccr/Source/Test/Config-And-Activation/Test.ts - the byte-exact assertion
- Site/Source/Component/Configurator.astro - the site surface
note: the schema default, the patch row and the README must agree or the smoke fails.
```

## 8. The plural family

The search suggester is the first consumer of the core pattern service
([PATTERN-GRAPH-PLUGIN.md](./PATTERN-GRAPH-PLUGIN.md), section 4). The family, restated with the
search consumer's status:

| Package                         | Role                                                                           | Status                                                |
| ------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `plugin-dsh-pattern`            | the service: the registry, the matcher, the learner, the store, the confidence | planned; extracted after two consumers                |
| `hook-dsh-search-suggester`     | the search intent -> the targets                                               | THIS document; the first consumer                     |
| `hook-dsh-edit-suggester`       | the modification intent -> the standard file set                               | planned; the second consumer (the extraction trigger) |
| `hook-dsh-doc-suggester`        | the doc task -> the plans, guides, site                                        | planned                                               |
| `hook-dsh-test-suggester`       | the test task -> the suite, folder, counts                                     | planned                                               |
| `hook-dsh-graph-suggester`      | the workspace graph -> the code-block neighborhood                             | planned; depends on the workspace v4.1 graph          |
| `hook-dsh-replay-suggester`     | the session history -> the last time this was done                             | planned                                               |
| `hook-dsh-convention-suggester` | the repo conventions -> the naming, layout, docs                               | planned                                               |

### 8.1 The core and the packs

- The CORE owns the service (`ctx.pattern.match(context) -> PatternMatch`), the registry, the store,
  the confidence math, and the learner.
- The CONSUMERS own their pattern packs and their delivery surface. A pack is DATA: the intents, the
  signals, the target rules, the reasons, the thresholds. A new domain is a pack, not a package,
  until it proves two consumers.
- The **two-consumer extraction rule**: the core is extracted only after the search consumer and one
  other consumer exist. Until then, the search consumer carries a private, embedded pack (the ten
  intents, the candidates, the rules) and no shared service. That keeps the first delivery cheap and
  the extraction honest.

### 8.2 The pack schema (the data, not code)

```json
{
	"pack": "search",
	"version": 1,
	"intents": [
		{
			"id": "Version",
			"priority": 1,
			"threshold": 0.85,
			"signals": [
				{ "rule": "literal", "pattern": "\\b\\d+\\.\\d+\\.\\d+\\b", "weight": 0.5 },
				{ "rule": "path", "pattern": "(^|/)package\\.json$", "weight": 0.4 }
			],
			"targets": [
				{
					"path": "package.json",
					"kind": "manifest",
					"prior": 1.0,
					"digest": "version",
					"reason": "the monorepo manifest"
				},
				{
					"path": "Site/Source/Library/Content.ts",
					"kind": "literal",
					"prior": 1.0,
					"digest": "Versions.Release",
					"reason": "the site release constant"
				}
			],
			"familyGlobs": ["**/README.md", "**/CONTRIBUTING.md", "**/SCHEME.md"],
			"abstain": ["exploratory", "ambiguous", "novel"]
		}
	]
}
```

The pack is the unit the core learns into, the unit the replay scores, and the unit a new domain
copies. The search consumer's pack is the reference implementation.

### 8.3 The delivery surfaces

The family already has three: the note on the tool result (the tool-coach pattern, the search
consumer's default), the system-prompt block (the live-containers pattern, the sticky section), and
the tool (the ccr pattern, the optional `search_suggester` query/dismiss tool). The core does not
deliver; each consumer picks its surface.

### 8.4 Why the search consumer ships first

It has the strongest evidence (section 1), the simplest transform (the read set - no edit to
decide), the clearest arbiter (the aggregate, the site build), and the highest token saving (the
reads). The edit suggester is the natural second consumer because its evidence is the same corpus
with a different label (the modification intent), and its transform is the one the search consumer
deliberately refuses to own.

## 9. The in-depth variants

These are the pattern graph's variants (PATTERN-GRAPH-PLUGIN.md, section 5), scoped to what the
search consumer's core could later serve.

### 9.1 The intent oracle

The core answers "what is the model trying to do?" as a ranked set of intents with the evidence. The
search consumer is one caller; the tool-coach could ask it (is this bash call a write or a search?),
the routing enforcer could ask it (is this task exploration or coding?), and the workspace could ask
it. The oracle is the classifier of section 4.3 with the delivery removed: a service method, not a
note. The risk: an oracle that is wrong silently steers other plugins; it must return the evidence
and a confidence, and every caller must be allowed to ignore it.

### 9.2 The graph query

The workspace v4.1 epic supplies the file graph and the code-block neighborhood. The pattern's
target subgraph becomes a graph query, and the suggestion is the instantiated neighborhood rather
than a flat list. For the search consumer, this upgrades the candidate list from "paths and globs"
to "the connected component around the symbol": the definition, the callers, the tests, the doc
block, the site mention. The v1 does not depend on the graph; the graph is the v2 substrate.

### 9.3 The session replay

The transcripts are the training corpus and the benchmark (section 10.5). The replay is also a
product: `hook-dsh-replay-suggester` answers "the last time this was done, the model touched these
12 files and verified with this command". The search consumer's journal is the seed for it: the
intent, the candidates, the outcome. The privacy posture is the same (repo-relative paths, local
only).

### 9.4 The convention compiler

The repo's conventions (the naming, the layout, the docs, the ledger strings) become patterns, and
the suggester enforces them before the model violates them. For the search consumer, the conventions
are already encoded in the candidate reasons ("the byte-exact assertion", "the build mirror - never
edit"); the compiler generalizes them into a pack the convention suggester consumes. The arbiter is
the smoke suite that asserts the convention.

### 9.5 The next-step planner

The `precedes` edges turn the pattern graph into a planner: after the version bump, the CHANGELOG,
then the site figures, then the publish. The search consumer can emit ONE next step ("after the
manifests, the CHANGELOG section") but never a plan; the planner is a separate consumer that reads
the same registry. The risk is the same as everywhere: a wrong plan is more expensive than a wrong
target, so the planner's threshold is higher and its abstention is cheaper.

## 10. The measurement

The plugin's claim is falsifiable, so it ships with its benchmark.

### 10.1 The primary metric

Search-class calls per task, before and after, on the same task type:

| Lane           | Baseline search calls | Targets | Baseline first-edit |
| -------------- | --------------------- | ------- | ------------------- |
| version bump   | 211                   | 143     | call 63             |
| overpass fix   | 159                   | 54      | call 48             |
| parent (mixed) | 257                   | 81      | call 74             |
| ets rename     | 56                    | 23      | call 10             |

Success: at least a 25% reduction in search-class calls on the version bump and the rename, with no
increase in wrong-file edits.

### 10.2 First-hit accuracy

The fraction of the eventual target set named by the FIRST suggestion of an intent. Baseline: 6%
(release), 9% (overpass), 19% (parent), 57% (site-totals). Target: 80% on Version and Path, 60% on
Test and Doc.

### 10.3 Acceptance rate

Followed candidates / emitted candidates, and followed notes / emitted notes. The kill criterion:
below 20% over 30 real tasks, stop and redesign (the model ignoring it is the biggest risk, and no
amount of index quality fixes it).

### 10.4 The token cost

The note's tokens (measured in the smoke) vs the search-result tokens it displaces. A note that
costs 150 tokens must save at least 1,500 tokens of reads to be worth it; the release lane's 202k
tokens of results give the headroom.

### 10.5 The replay benchmark

`Maintain/Replay-Search-Suggester.mjs`:

1. Load the recorded call sequences (the 2,658-call corpus, anonymized to paths and intents).
2. Freeze the memory at the pre-session state.
3. Replay each call through the real built classifier and resolver.
4. Score: intent precision/recall against the hand labels, candidate recall@7 against the eventual
   target set, the call index of the first note vs the call index of the first edit, the notes per
   turn, the abstention rate and its correctness (the abstentions that would have been wrong
   suggestions).

The replay is deterministic, so it is the regression gate: a rule change that lowers recall@7 on the
corpus fails the build.

## 11. The phases P0-P6

The search lane's phases; the core's phases are in PATTERN-GRAPH-PLUGIN.md (section 8) and P1 is
shared.

| Phase | Work                                                                                                                                                                                                                      | Acceptance                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| P0    | The corpus: extract the 17 sessions to `Test/Fixtures/Search-Suggester/*.jsonl` (paths + call names + arguments only), write the analyzer, freeze the baseline in `Documentation/Researches/SEARCH-SUGGESTER-EVIDENCE.md` | the baseline table reproduces                                                                       |
| P1    | The classifier: the pure functions, the ten rule groups, the priority, the scope, the algebra, the abstention; no delivery; a dry-run ledger line per call                                                                | the Classification and Abstention smokes pass; the replay reports intent precision                  |
| P2    | The index: `Maintain/Index-Search-Targets.mjs`, the fingerprint, the digests, the family globs, the JSON schema, the boot load                                                                                            | the index names 90%+ of the release lane's 143 targets as candidate families                        |
| P3    | The delivery: the post-execute note, the source label, the gate, the cooldown, the dedupe, the cap                                                                                                                        | the Delivery and Noise smokes pass; a scripted bump on a scratch copy runs on/off                   |
| P4    | The memory and the learning: the persistence, the atomic write, the corruption fallback, the follow/ignore/near-miss, the update rule, the offline seed                                                                   | the Persistence and Learning smokes pass; the replay shows the learned index beating the static one |
| P5    | The second surface: the sticky section, the pre-step reset, the TTL, the `tools/change` invalidation                                                                                                                      | the section smoke passes; the token cost is measured                                                |
| P6    | The hardening: the nine smokes green at their counts, the replay gate, the README/SCHEME, the site page, the INDEX row, the release                                                                                       | the aggregate green, the site build green, the ledger strings byte-identical                        |

Total: about 13 working days, one lane, no other plugin touched. The core extraction is NOT in this
lane: it waits for the second consumer (section 8.1).

## 12. The risks

**Misclassification.** A semver literal in a lockfile is not a version bump. Mitigation: the scope
override (R1 loses to a lockfile scope), the threshold, the stated intent and confidence so the
model can reject it, and the dismissal path.

**Noise.** A note on every call trains the model to ignore notes. Mitigation: the cooldown, the
dedupe, the per-turn cap, the already-read filter, and the zero-note noise smoke.

**A wrong suggestion is worse than none.** The model follows the note into the wrong file and edits
it. Mitigation: the high threshold (0.75, 0.85 for the destructive intents), at most 7 candidates, a
reason per candidate, and the abstention path (section 2.4). The wrong suggestion is the expensive
error; the abstention is the cheap one.

**The pattern overreach.** The suggester drifts into planning the edit ("change these 12 files to
0.1.1"). Mitigation: the search consumer never owns the Transform node; the transform is the
model's, and the plugin's ledger says so.

**Privacy.** The knowledge file leaks paths and intents. Mitigation: repo-relative paths only, no
contents, 0600, a documented reset, and the offline learner as an explicit user action.

**Performance.** A classifier on every tool call. Mitigation: pure functions, a frozen index, no
I/O, a 1 ms budget, and the note build only when the gate passes.

**Staleness.** The index drifts when files move. Mitigation: the fingerprint rebuild, the stale
ledger line, the near-miss learning, and the degradation to the static defaults.

**The model ignores it.** The largest risk, and the one no design certainty can remove. Mitigation:
the acceptance metric and the kill criterion; the note's format is one line of intent plus a short
list, not a paragraph.

**The note pollutes the transcript.** `additionalContexts` are durable and model-visible.
Mitigation: the source label, the 120-char summary, the `notice` form, and `enabled: false` as the
escape hatch.

**The tool-coach collision.** Both plugins can add a context to the same call. Mitigation: disjoint
trigger sets (the coach judges `bash` content-class offenses; the suggester judges search intents),
the suggester's own source kind, and the per-turn cap counted per plugin.

**The CCR interaction.** The CCR replaces content; the note is a separate message. No conflict by
construction, but the order is asserted in the smoke (the note survives a compressed result).

**The core dependency.** If the core is extracted too early, the search consumer pays for a service
it does not use. Mitigation: the two-consumer rule; the search consumer's pack is embedded until the
second consumer lands.

## 13. The open decisions

1. The name: `hook-dsh-search-suggester` (descriptive, long) vs `hook-dsh-searchable` (the user's
   formalism) vs `hook-dsh-target-suggester`. Recommendation: the first; the package name is the
   identity, and "searchable" reads as an adjective.
2. The archetype: a hook with no service (recommended for v1) vs a plugin with a
   `searchSuggester.lookup(intent)` service the orchestration plugins could query. The service is a
   P6 option, not a P0 requirement.
3. The index: generated at build (a committed JSON) vs at boot (a generated cache under `~/.dsh`) vs
   on demand. Recommendation: the boot cache with a committed seed for the canonical set, so a fresh
   machine works before the first generation.
4. The memory location: a directory `~/.dsh/search-suggester/` vs a single JSON. Recommendation: the
   directory (the index and the knowledge have different lifetimes).
5. The learning: online only vs online + the offline seed. Recommendation: both, with the offline
   seed as a Maintain script the user runs.
6. The LLM: none in the hot path (binding). The offline clustering may use one later; that is a
   separate script, not the plugin.
7. The default: enabled or disabled. Recommendation: enabled with `threshold 0.75` and
   `maxNotesPerTurn 3`; the family's live-containers precedent ships disabled, but a suggester that
   ships disabled teaches nothing. The A/B in P3 decides.
8. The pattern language: a JSON pack (recommended; the data is the contract, the smokes assert it)
   vs a TypeScript DSL compiled to the registry. The JSON pack is what the learner writes and the
   replay scores.
9. The pack boundary: one package with packs vs one package per domain after two consumers.
   Recommendation: the latter (the family's extraction rule).
10. The INDEX row: left to the parent (the plan is written; the INDEX is being edited concurrently
    by the release lane; one row is the follow-up).

## 14. The relation to the existing plugins

**Why not the tool-coach.** The coach teaches the TOOL, not the TARGET: its detection is a
bash-content classifier (write/read/search/discovery/ control), its remedy is a tool name, and its
state is a strike counter. It cannot say "the version lives in 36 package.json and 6 Apply.ts"
because it has no repo index and no intent algebra. Merging would couple its zero-noise guarantee to
a much noisier signal and would make its tier-2 section carry file lists. What the suggester REUSES:
the note builder and the source label (`Note.ts`), the waterfall discipline (`next()` first,
fail-open), the per-agent WeakMap, the volatile-config posture, the ledger style, and the smoke
harness. They are siblings, not one plugin.

**Why not the ccr.** The ccr reduces the cost of ONE result (compress, cache, retrieve). The
suggester reduces the NUMBER of calls. The ccr's `{prepend: true}` listener runs first and replaces
content; the suggester runs after and only adds `additionalContexts`. They compose without overlap,
and the suggester's note must never be compressed (it is a message, not content).

**Why not the live-containers Suggester.** That suggester is an LLM mini-conversation: a detached
one-shot subagent receives a request excerpt plus a catalog and returns a strict JSON template
suggestion, planted as a block or shown as a section, accepted or dismissed by a one-word command.
It is not in the tool path, it costs a model call, and its subject is a live-container template, not
a file. The search suggester is deterministic, synchronous, in the tool path, and its subject is the
repo index. What it REUSES: the accept/dismiss vocabulary, the privacy posture (redact by default),
the gate (first-of-turn, rate cap), and the "suggestion as a labeled artifact" pattern. What it
REJECTS: the LLM route, which the user's brief forbids in the hot path.

**The pattern graph.** The general model ([PATTERN-GRAPH-PLUGIN.md](./PATTERN-GRAPH-PLUGIN.md)) owns
the behavior graph, the four patternize-able conditions, the family roster, and the learner. This
document is its first instance: the `Searchable<X>` consumer with the search evidence and the
concrete pack. The pattern graph document should not repeat the search numbers, and this document
should not repeat the general algebra.

**The orchestration plans.** ROUTING-ENFORCER is the closest shape: a deterministic resolver, a
silent injection, a ledger. HONEST-FEEDBACK is the closest format: a fixed block with a fixed
vocabulary. BATCH-STATE and SUBAGENT-QUEUE own stores the suggester does not need. The suggester is
a KNOWLEDGE plugin, not an orchestration one; later, the BATCH-STATE compiler could read its intent
as a gate ("this lane is a version bump; the version targets are ..."), but that is a P6
integration, not a dependency.

## 15. Appendix - the evidence commands

```sh
# the corpus
ls ~/.dsh/sessions/--Volumes-CORSAIR-Developer-macOS-Application-PlayForm-DeepSeek--/
zstd -dc < session > /session.v4.jsonl.zstd | wc -l

# the counts (the analyzer used for section 1)
# tool/call: data.name + data.arguments
# tool/result: data.message.toolCallId + data.message.content[].text
# search-class: grep | glob | read | bash(grep|rg|find|ls|sed -n|awk)

# the release lane's version sweeps (the then-current literal)
grep -c '0\\.0\\.1' # 30 of 46 greps
# the overpass lane's build sweeps
grep -c 'error TS' # 32 of 58 greps
# the workspace's repeated patterns
# 41 of 394 sessions contain a repeated grep pattern
```

The exact per-session tables live in the P0 research output; this document carries the summary and
the design.
