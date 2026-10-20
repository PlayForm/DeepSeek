---
title: The Pattern Graph - the general suggestion model and its plugin family
category: Plans
kind: queued-plan
date: 2026-10-21
status: planned
registry: Documentation/Plans/PATTERN-GRAPH-PLUGIN.md
index: Documentation/INDEX.md
statuses:
  - name: the generalization thesis (the search suggester as one instance)
    state: resolved
    evidence: this document - the patternize-able definition and the behavior graph
  - name: the behavior graph model (the five node kinds and the algebra)
    state: open
    evidence: section 2; the model is proposed, not implemented
  - name: the plural family (the core service and the domain plugins)
    state: open
    evidence: section 4; the packages are planned, none exists
  - name: the learner (the session replay to the pattern registry)
    state: open
    evidence: section 3; the sessions are the corpus
  - name: the measurement (the search reduction and the acceptance)
    state: open
    evidence: section 7
  - name: the phases P0-P7
    state: planned
    evidence: section 8
---

# The Pattern Graph

The search suggester is not one plugin. It is one **consumer** of a
general capability: **patternize-able behavior over graphs of files**. This
document states the general model, the plural plugin family, the boundary
where a suggestion must abstain, and the measurement that decides whether
the family is worth its tokens.

## 1. The definition: what is patternize-able

A behavior is patternize-able when all four hold:

1. **An observable trigger.** Something in the live context - a tool call,
   a file state, the user's words - signals the behavior.
2. **A target subgraph.** The behavior touches a repeatable set of files,
   code blocks, symbols, or documents, connected by the file graph.
3. **A deterministic transform.** The edits are mechanical given the
   target: a version bump, a rename, a config field, a doc update.
4. **An arbiter.** The behavior has a verification: the build, a smoke, the
   site build, the Drift.

If any of the four is missing, the behavior is **not** patternize-able and
the plugin must **abstain**. The novel design decision, the ambiguous
investigation, the one-off debugging, and the open-ended research are
explicitly outside the model. A wrong suggestion costs more than a missed
one; abstention is a feature.

## 2. The behavior graph

### 2.1 The nodes

| Node | Carries | Example |
| --- | --- | --- |
| Intent | the task kind and its parameters | VersionBump(family, 0.1.0) |
| Trigger | the signals that identify it | a grep for `0.0.1` in a manifest context |
| Target | a subgraph of the file graph | the manifests, README, CHANGELOG, site Content, the ccr Version |
| Transform | the edit operations, ordered | the version fields, the pins, the doc figures |
| Arbiter | the verification | the aggregate, the site build, Drift |
| Evidence | the session traces that support it | the last three version bumps |

### 2.2 The edges

- `matches`: Trigger -> Intent.
- `targets`: Intent -> Target.
- `applies`: Intent -> Transform.
- `verifies`: Intent -> Arbiter.
- `supports`: Evidence -> Intent and Evidence -> Target.
- `precedes`: Intent -> Intent (the sequence: bump, then release, then docs).

### 2.3 The pattern

A **pattern type** is a parameterized subgraph:
`Pattern<X> = Trigger<X> x TargetGraph<X> x Transform<X>* x Arbiter<X>`.
A **pattern instance** is the type bound to the current parameters. The
match is `context -> Pattern<X>`; the suggestion is the instantiated
target subgraph plus the next steps.

The algebra:

- **Composition**: a release is `VersionBump` then `Changelog` then
  `SiteFigures` then `Publish`; the composition is the ordered product.
- **Sequence**: a rename is `SymbolRewrite` then `TestUpdates` then
  `DocUpdates`; the `precedes` edges carry the order.
- **Parameterization**: the same `VersionBump` pattern applies to any
  package; the parameters are the package set and the version.
- **Abstention**: if the match's confidence is below the threshold, the
  result is the empty suggestion, not a guess.

### 2.4 The `Searchable<X>` instance

The search suggester is the `Searchable<X>` pattern:
`X` is the intent (Version, Symbol, Config, Test, Doc, Dependency, Path,
Usage, Owner, Ledger); the trigger is the search tool call (the pattern,
the scope, the recent context); the target is the subgraph of files where
`X` usually lives; the transform is "open these, then edit"; the arbiter
is the eventual build/test. The suggestion is the target subgraph, ranked.

## 3. The learner

The sessions are the corpus:

1. **The trace**: the tool calls, the edits, the outcomes, the timings from
   the session records (`~/.dsh/sessions/.../session.v4.jsonl.zstd`).
2. **The subgraph mining**: the frequent (search -> read -> edit ->
   verify) subgraphs become candidate patterns.
3. **The binding**: the intent label from the user's request or the
   eventual edit; the target subgraph from the files touched; the arbiter
   from the verification that ran.
4. **The confidence**: the frequency, the outcome (did the edit succeed and
   verify?), the recency, the acceptance (did the model use the
   suggestion?).
5. **The refresh**: offline from the sessions; online from the live
   accept/reject and the model's next reads. The memory is local, never
   the repo; the schema is versioned; a stale pattern decays.

The cold start is the static repo map plus the family's conventions (the
standard files per intent), not an empty registry.

## 4. The plural family

One core service, several consumers, and the patterns as data:

| Package | Role |
| --- | --- |
| `plugin-dsh-pattern` (or `hook-dsh-pattern`) | the service: the registry, the matcher, the learner, the store, the confidence |
| `hook-dsh-search-suggester` | the search intent -> the targets |
| `hook-dsh-edit-suggester` | the modification intent -> the standard file set |
| `hook-dsh-doc-suggester` | the doc task -> the plans, guides, site |
| `hook-dsh-test-suggester` | the test task -> the suite, folder, counts |
| `hook-dsh-graph-suggester` | the workspace graph -> the code-block neighborhood |
| `hook-dsh-replay-suggester` | the session history -> the last time this was done |
| `hook-dsh-convention-suggester` | the repo conventions -> the naming, layout, docs |

The **core** owns the service and the storage; the **consumers** own their
pattern packs and their delivery surface. A pack is data (the patterns,
the signals, the targets), so a new domain is a pack, not a package, until
it proves two consumers. The family's extraction rule applies: extract the
shared core only after two consumers exist.

The delivery surfaces are the ones the family already has: a note on the
tool result (the tool-coach pattern), a system-prompt block (the
live-containers pattern), a tool (the ccr pattern). The suggestion is a
short note: the intent, the confidence, the top targets, and the one next
step. No prose.

## 5. The in-depth variants

- **The intent oracle**: the core answers "what is the model trying to do?"
  as a ranked set of intents with the evidence. The suggester is one
  consumer; the tool-coach, the routing, and the workspace could be
  others.
- **The graph query**: the workspace graph (the v4.1 epic) is the
  substrate; the pattern's target subgraph is a graph query, and the
  suggestion is the instantiated neighborhood.
- **The session replay**: the transcripts are the training corpus; a
  replay harness measures the suggestion's effect on the search count and
  the time to the first correct edit.
- **The convention compiler**: the repo's conventions (the naming, the
  layout, the docs) become patterns; the suggester enforces them before
  the model violates them.
- **The next-step planner**: the `precedes` edges turn the pattern graph
  into a planner: after the version bump, the release, then the docs.

## 6. The boundary: when to abstain

- The intent's confidence is below the threshold.
- The target subgraph is empty or ambiguous (two patterns match equally).
- The behavior is novel (no evidence, no static pattern).
- The user's request is exploratory ("figure out why").
- The suggestion would repeat one already given and ignored.

The plugin's ledger records the abstentions, so the precision can be
measured, not assumed.

## 7. The measurement

- **The search reduction**: the search tool calls per task, before and
  after.
- **The first-hit accuracy**: the suggested target that the model actually
  used, at rank 1 and in the top 3.
- **The acceptance rate**: the suggestions the model acted on.
- **The time to the first correct edit**.
- **The token cost**: the suggestion notes' tokens versus the saved
  searches.
- **The replay benchmark**: the recorded sessions replayed with and
  without the suggester.
- **The precision/recall**: the wrong suggestions are the expensive error;
  the abstention is cheap.

## 8. The phases

| Phase | Work | Acceptance |
| --- | --- | --- |
| P0 | The evidence: mine the sessions, label the intents, build the static map | the intent counts, the repeated searches, the standard files per intent |
| P1 | The core service: the registry, the matcher, the store | a fake-ctx smoke; the match returns the pattern with a confidence |
| P2 | The search suggester: the delivery on the tool result | the version-bump example; the search count drops in a replay |
| P3 | The learner: the offline mining; the online accept/reject | the pattern refresh; the confidence calibration |
| P4 | The plural consumers: edit, doc, test, graph, replay | each pack; the precision per pack |
| P5 | The graph integration: the workspace v4.1 as the substrate | the code-block neighborhood suggestions |
| P6 | The convention compiler and the next-step planner | the conventions enforced; the sequence planned |
| P7 | The measurement and the docs | the replay benchmark; the site page |

## 9. The risks

1. **The wrong suggestion is worse than none.** Mitigate: the confidence
   threshold, the abstention, the top-3 with the evidence.
2. **The noise.** Mitigate: the cooldown, the dedupe, the dismiss, the
   short note.
3. **The overfitting to this repo.** Mitigate: the patterns are
   parameterized; the packs are data; the cold start is the static map.
4. **The privacy.** The sessions and the memory stay local; no network.
5. **The performance.** The match is a lookup plus a graph query, not an
   LLM call; the listeners are synchronous recorders; the heavy mining is
   offline.
6. **The model ignores it.** Measure the acceptance; if it is low, the
   suggestion is noise, not help.
7. **The crutch.** The suggester must not replace the model's own
   orientation; it accelerates the standard behavior, it does not decide
   the novel one.
8. **The stale pattern.** The confidence decays; the arbiter's outcome
   updates it.

## 10. The open decisions

1. The core's name and archetype: a service plugin (`plugin-dsh-pattern`)
   or a hook (`hook-dsh-pattern`).
2. The storage: the KV domain (the family's storage) or a local JSON
   under `~/.dsh`.
3. The pattern language: a JSON schema, or a TypeScript DSL compiled to
   the registry.
4. The pack boundary: one package with packs, or one package per domain
   after two consumers.
5. The delivery surface: the tool-result note, the system-prompt block,
   or both.
6. The session-mining privacy: which transcripts, how long, what is
   redacted.
7. The relation to the workspace graph: does the pattern graph depend on
   the workspace graph, or is the file graph enough for v1?

## 11. The relation to the other plans

- The **search suggester** (`SEARCH-SUGGESTER-PLUGIN.md`) is the first
  consumer and the evidence base.
- The **workspace v4.1** supplies the file graph and the code-block
  neighborhood; the pattern graph is the behavior layer over it.
- The **tool-coach** is the delivery precedent and a potential consumer
  (the coaching notes and the suggestions share the tool surface).
- The **orchestration family** (the routing, the queue, the feedback)
  could consume the intent oracle, but only after the core proves itself.
