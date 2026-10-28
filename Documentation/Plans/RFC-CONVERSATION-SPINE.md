---
title: The conversation spine - one bus every plugin can read
category: Plans
kind: queued-plan
date: 2026-10-28
status: planned
registry: Documentation/Plans/RFC-CONVERSATION-SPINE.md
index: Documentation/INDEX.md
statuses:
    - name: the problem (six of 106 plugins can see the conversation)
      state: resolved
      evidence: section 1
    - name: the existing pattern to copy (the trace bus)
      state: resolved
      evidence: section 2
    - name: the design (lib vocabulary, factory service, per-plugin adapter)
      state: resolved
      evidence: section 3
    - name: the adapter rule (the provider ships the adapter)
      state: resolved
      evidence: section 4
    - name: the migration order and the first slice
      state: open
      evidence: section 5
    - name: the implementation
      state: open
      evidence: section 6
---

# The conversation spine - one bus every plugin can read

> Every plugin in the family should know what is happening inside a conversation - the turn, the
> step, the model call, the tool call, the file touched - without each one registering its own
> listener on the session log. This RFC proposes a conversation bus built exactly like the trace bus
> that already works, with the adapter owned by the provider rather than copied by the consumer.

## 1. The problem

A grep of the family finds **six** packages that listen to `session/event`:

```text
hook-dsh-batch-decision, hook-dsh-live-containers, plugin-dsh-batch-edit,
plugin-dsh-batchstate, plugin-dsh-cost, plugin-dsh-feedback
```

The other hundred cannot see the conversation at all. Three consequences follow.

1. **A plugin that wants one fact must re-register the whole feed.** Any future "when the turn ends,
   do X" plugin repeats the listener, the queue, the drain and the disposal - four pieces of
   machinery that the six above already implement six slightly different ways.
2. **The same derivation is written more than once.** "Which files did this step touch" exists in
   the ledger, in the batch tools and in the batch decision hook, each with its own parse of the
   tool arguments.
3. **The adapters are invisible.** A plugin that could reuse another plugin's derivation cannot see
   it, because the family rule is that no plugin imports another plugin - a rule that is right, and
   that currently leaves the shared derivation with nowhere to live except in each consumer.

## 2. The pattern that already works

The trace bus is the precedent, and it is the shape this RFC copies rather than invents:

```text
source plugin --adapter--> trace bus --adapter--> consumer plugin
```

- `lib-dsh-trace` holds the **vocabulary and the loop** - the service name, the event names, the
  envelope types, the coalescing queue, the flush, the disposer - and imports nothing from any
  plugin.
- `plugin-dsh-factory` **provides the bus** as `ctx.trace`, because it owns the family's shared
  machinery.
- Each adapting plugin carries its own thin `Source/Trace/` adapter and imports the names from the
  library, so **no plugin imports another plugin**.

That last line is the whole design: the dependency arrow points at the library, never at a sibling.

## 3. The conversation bus

Same three parts, one new subject.

### 3.1 The library: `lib-dsh-conversation`

Pure, harness-free, dependency-light, in both trees (`ets-lib-dsh-conversation` as the twin). It
owns:

- **The names.** `service: "conversation"`, and the emitted events: `conversation/turn`,
  `conversation/step`, `conversation/call`, `conversation/tool`, `conversation/touch`,
  `conversation/end`.
- **The envelope.** One record per emitted event: the session id, the turn, the step, the sequence,
  the time, and the payload for that kind.
- **The fold.** A pure function from the session log's events to the conversation state: the current
  turn and step, the calls with their usage, the tool calls with their resolved touches (path, kind,
  bytes), and the files touched so far. This is where the derivation lives once instead of three
  times.
- **The loop.** The same coalescing queue as the trace bus: one in-flight task per session, no
  timers in the hot path, fail-open, a `Flush` promise for deterministic smokes, a disposer.

### 3.2 The service: `ctx.conversation`

Provided by `plugin-dsh-factory` beside `ctx.trace`, because the factory already owns the shared
machinery and the ledger. It subscribes to `session/event` **once**, folds through the library's
pure function, and emits the `conversation/*` events on the bus. A plugin that wants conversation
awareness injects `conversation` and subscribes to the event it needs.

The bus is the only listener on `session/event` after the migration, which also removes the current
six-way duplication of the queue and the drain.

### 3.3 The consumer: one thin adapter per plugin

A plugin that wants the conversation carries `Source/Conversation/Adapter.ts` - under forty lines:
inject `conversation`, subscribe to the two or three events it needs, keep the latest state in a
cell, dispose with the fiber. It imports the names and types from `lib-dsh-conversation` and nothing
from any sibling.

## 4. The adapter rule

The user's rule, stated so a lane can apply it without judgement:

> **If plugin A can use something plugin B already has, plugin B ships the adapter for A inside its
> own `Source/`, and A imports the adapter from B's published surface. A never re-implements it, and
> B never absorbs A's behaviour.**

Concretely, in this family:

- The **library** owns anything pure and shared (the vocabulary, the fold, the parsers).
- The **provider** owns anything that needs the runtime (the bus, the ledger, the write executor)
  and ships the typed adapter for its consumers.
- The **consumer** owns only its own policy, and its `Source/<Subject>/Adapter.ts` is the seam.

A consumer that finds itself writing a second copy of a derivation has found a missing adapter, and
the fix belongs in the provider, not in the consumer.

## 5. The migration order

The first slice proves the pattern end to end on one consumer that already has a working listener,
so a regression is visible immediately:

1. `lib-dsh-conversation`: the names, the envelope, the fold, the loop. Pure; smokes cover the fold
   against recorded session events.
2. `plugin-dsh-factory`: provide `ctx.conversation`, wire the single `session/event` listener, emit
   the events. The factory's smoke asserts one listener and one flush.
3. `plugin-dsh-cost`: replace its own `session/event` + `session/flush` pair with the adapter. Its
   ledger must be byte-identical before and after - the same rows for the same transcript.
4. The other five listeners migrate in the same way, one package per change set, each with the
   byte-identical ledger assertion.
5. Every plugin that wants conversation awareness gains its adapter; a package with no interest in
   the conversation stays untouched, which is the point - the bus is opt-in per consumer.

## 6. Acceptance

- `grep -rl 'session/event' Classic/packages/*/Source` returns the factory and nothing else.
- The six migrated plugins' ledgers are byte-identical against a recorded transcript before and
  after.
- A seventh consumer can be added without touching any other package: its adapter is the only new
  code, and it imports only the library.
- `pnpm Drift` and the site build are unaffected.

## 7. What this RFC does not do

It does not merge the six existing listeners in one pass, and it does not move any plugin's policy
into the factory. The bus carries facts; the consumers keep their opinions.
