---
title: The Pattern Graph - the general suggestion model and its plugin family
category: Plans
kind: queued-plan
date: 2026-10-21
status: implemented (PoC)
registry: Documentation/Plans/PATTERN-GRAPH-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the generalization thesis (the search suggester as one instance)
      state: resolved
      evidence: this document - the patternize-able definition and the behavior graph
    - name: the behavior graph model (the five node kinds and the algebra)
      state: implemented (PoC)
      evidence:
          plugin-dsh-pattern under Classic/packages/; the PoC-vs-plan grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the plural family (the core service and the domain plugins)
      state: implemented (PoC)
      evidence:
          plugin-dsh-pattern + the seven suggester hooks under Classic/packages/; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the learner (the session replay to the pattern registry)
      state: implemented (PoC)
      evidence:
          the record/decay path in plugin-dsh-pattern; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the measurement (the search reduction and the acceptance)
      state: open
      evidence: section 7
    - name: the phases P0-P7
      state: planned
      evidence: section 8
---

# The Pattern Graph

The search suggester is not one plugin, because it is one **consumer** of a general capability:
**patternize-able behavior over graphs of files**.

This document states the general model, the plural plugin family, the boundary where a suggestion
must abstain, and the measurement that decides whether the family is worth its tokens.

## 1. The definition: what is patternize-able

A behavior is patternize-able when all four hold:

1. **An observable trigger.**

    Something in the live context (a tool call, a file state, or the words of the user) signals the
    behavior.

2. **A target subgraph.**

    The behavior touches a repeatable set of files, code blocks, symbols, or documents that the file
    graph connects.

3. **A deterministic transform.**

    The edits are mechanical given the target: a version bump, a rename, a config field, or a doc
    update.

4. **An arbiter.**

    The behavior has a verification: the build, a smoke, the site build, or the Drift.

If any of the four is missing, the behavior is **not** patternize-able and the plugin must
**abstain**.

The novel design decision, the ambiguous investigation, the one-off debugging, and the open-ended
research are explicitly outside the model.

A wrong suggestion costs more than a missed one, so abstention is a feature.

## 2. The behavior graph

### 2.1 The nodes

| Node      | Carries                            | Example                                                         |
| --------- | ---------------------------------- | --------------------------------------------------------------- |
| Intent    | the task kind and its parameters   | VersionBump(family, 0.1.0)                                      |
| Trigger   | the signals that identify it       | a grep for `0.0.1` in a manifest context                        |
| Target    | a subgraph of the file graph       | the manifests, README, CHANGELOG, site Content, the ccr Version |
| Transform | the edit operations, ordered       | the version fields, the pins, the doc figures                   |
| Arbiter   | the verification                   | the aggregate, the site build, Drift                            |
| Evidence  | the session traces that support it | the last three version bumps                                    |

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

A **pattern instance** is the type bound to the current parameters, the match is
`context -> Pattern<X>`, and the suggestion is the instantiated target subgraph plus the next steps.

The algebra:

- **Composition**: a release is `VersionBump`, then `Changelog`, then `SiteFigures`, then `Publish`,
  and the composition is the ordered product.
- **Sequence**: a rename is `SymbolRewrite`, then `TestUpdates`, then `DocUpdates`, and the
  `precedes` edges carry the order.
- **Parameterization**: the same `VersionBump` pattern applies to any package, and the parameters
  are the package set and the version.
- **Abstention**: when the confidence of the match is below the threshold, the result is the empty
  suggestion and not a guess.

### 2.4 The `Searchable<X>` instance

The search suggester is the `Searchable<X>` pattern, where `X` is the intent (Version, Symbol,
Config, Test, Doc, Dependency, Path, Usage, Owner, Ledger), the trigger is the search tool call with
the pattern, the scope, and the recent context, the target is the subgraph of files where `X`
usually lives, the transform is "open these, then edit", and the arbiter is the eventual build or
test.

The suggestion is the target subgraph, ranked.

## 3. The learner

The sessions are the corpus:

1. **The trace.**

    The tool calls, the edits, the outcomes, and the timings from the session records
    (`~/.dsh/sessions/.../session.v4.jsonl.zstd`).

2. **The subgraph mining.**

    The frequent (search -> read -> edit -> verify) subgraphs become candidate patterns.

3. **The binding.**

    The intent label from the request of the user or from the eventual edit, the target subgraph
    from the files touched, and the arbiter from the verification that ran.

4. **The confidence.**

    The frequency, the outcome of whether the edit succeeded and verified, the recency, and the
    acceptance of whether the model used the suggestion.

5. **The refresh.**

    Offline from the sessions and online from the live accept or reject and the next reads of the
    model, where the memory is local and never in the repo, the schema is versioned, and a stale
    pattern decays.

The cold start is the static repo map plus the conventions of the family (the standard files per
intent) and not an empty registry.

## 4. The plural family

One core service, several consumers, and the patterns as data:

| Package                         | Role                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `plugin-dsh-pattern`            | the service: the registry, the matcher, the learner, the store, the confidence |
| `hook-dsh-search-suggester`     | the search intent -> the targets                                               |
| `hook-dsh-edit-suggester`       | the modification intent -> the standard file set                               |
| `hook-dsh-doc-suggester`        | the doc task -> the plans, guides, site                                        |
| `hook-dsh-test-suggester`       | the test task -> the suite, folder, counts                                     |
| `hook-dsh-graph-suggester`      | the workspace graph -> the code-block neighborhood                             |
| `hook-dsh-replay-suggester`     | the session history -> the last time this was done                             |
| `hook-dsh-convention-suggester` | the repo conventions -> the naming, layout, docs                               |

The **core** owns the service and the storage, and the **consumers** own their pattern packs and
their delivery surface.

A pack is data (the patterns, the signals, and the targets), so a new domain is a pack and not a
package until it proves two consumers, and the extraction rule of the family applies: extract the
shared core only after two consumers exist.

The delivery surfaces are the ones that the family already has: a note on the tool result (the
tool-coach pattern), a system-prompt block (the live-containers pattern), and a tool (the ccr
pattern).

The suggestion is a short note with the intent, the confidence, the top targets, and the one next
step, and no prose.

## 5. The in-depth variants

- **The intent oracle**: the core answers "what is the model trying to do?" as a ranked set of
  intents with the evidence, where the suggester is one consumer and the tool-coach, the routing,
  and the workspace could be others.
- **The graph query**: the workspace graph of the v4.1 epic is the substrate, the target subgraph of
  the pattern is a graph query, and the suggestion is the instantiated neighborhood.
- **The session replay**: the transcripts are the training corpus, and a replay harness measures the
  effect of the suggestion on the search count and the time to the first correct edit.
- **The convention compiler**: the conventions of the repo (the naming, the layout, and the docs)
  become patterns, and the suggester enforces them before the model violates them.
- **The next-step planner**: the `precedes` edges turn the pattern graph into a planner, so after
  the version bump come the release and then the docs.

## 6. The boundary: when to abstain

- The confidence of the intent is below the threshold.
- The target subgraph is empty or ambiguous, because two patterns match equally.
- The behavior is novel, with no evidence and no static pattern.
- The request of the user is exploratory ("figure out why").
- The suggestion would repeat one that was already given and ignored.

The ledger of the plugin records the abstentions, so the precision can be measured and not assumed.

## 7. The measurement

- **The search reduction**: the search tool calls per task, before and after.
- **The first-hit accuracy**: the suggested target that the model actually used, at rank 1 and in
  the top 3.
- **The acceptance rate**: the suggestions that the model acted on.
- **The time to the first correct edit**.
- **The token cost**: the tokens of the suggestion notes against the saved searches.
- **The replay benchmark**: the recorded sessions replayed with and without the suggester.
- **The precision and recall**: the wrong suggestions are the expensive error, and the abstention is
  cheap.

## 8. The phases

| Phase | Work                                                                     | Acceptance                                                              |
| ----- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| P0    | The evidence: mine the sessions, label the intents, build the static map | the intent counts, the repeated searches, the standard files per intent |
| P1    | The core service: the registry, the matcher, the store                   | a fake-ctx smoke; the match returns the pattern with a confidence       |
| P2    | The search suggester: the delivery on the tool result                    | the version-bump example; the search count drops in a replay            |
| P3    | The learner: the offline mining; the online accept/reject                | the pattern refresh; the confidence calibration                         |
| P4    | The plural consumers: edit, doc, test, graph, replay                     | each pack; the precision per pack                                       |
| P5    | The graph integration: the workspace v4.1 as the substrate               | the code-block neighborhood suggestions                                 |
| P6    | The convention compiler and the next-step planner                        | the conventions enforced; the sequence planned                          |
| P7    | The measurement and the docs                                             | the replay benchmark; the site page                                     |

## 9. The risks

1. **The wrong suggestion is worse than none.**

    Mitigate with the confidence threshold, the abstention, and the top 3 with the evidence.

2. **The noise.**

    Mitigate with the cooldown, the dedupe, the dismiss, and the short note.

3. **The overfitting to this repo.**

    Mitigate because the patterns are parameterized, the packs are data, and the cold start is the
    static map.

4. **The privacy.**

    The sessions and the memory stay local, and nothing goes to the network.

5. **The performance.**

    The match is a lookup plus a graph query and not an LLM call, the listeners are synchronous
    recorders, and the heavy mining is offline.

6. **The model ignores it.**

    Measure the acceptance, because a low acceptance means that the suggestion is noise and not
    help.

7. **The crutch.**

    The suggester must not replace the own orientation of the model, because it accelerates the
    standard behavior and does not decide the novel one.

8. **The stale pattern.**

    The confidence decays, and the outcome of the arbiter updates it.

## 10. The open decisions

1. **The name and archetype of the core.**

    The service plugin `plugin-dsh-pattern` is settled, because the `hook-` alternative is
    superseded by the role contract: a registry, a matcher, and a store are a service.

2. **The storage.**

    The KV domain of the family storage, or a local JSON under `~/.dsh`.

3. **The pattern language.**

    A JSON schema, or a TypeScript DSL compiled to the registry.

4. **The pack boundary.**

    One package with packs, or one package per domain after two consumers.

5. **The delivery surface.**

    The tool-result note, the system-prompt block, or both.

6. **The session-mining privacy.**

    Which transcripts, how long, and what is redacted.

7. **The relation to the workspace graph.**

    Does the pattern graph depend on the workspace graph, or is the file graph enough for v1?

## 11. The relation to the other plans

- The **search suggester** (`SEARCH-SUGGESTER-PLUGIN.md`) is the first consumer and the evidence
  base.
- The **workspace v4.1** supplies the file graph and the code-block neighborhood, and the pattern
  graph is the behavior layer over it.
- The **tool-coach** is the delivery precedent and a potential consumer, because the coaching notes
  and the suggestions share the tool surface.
- The **orchestration family** (the routing, the queue, and the feedback) could consume the intent
  oracle, but only after the core proves itself.
