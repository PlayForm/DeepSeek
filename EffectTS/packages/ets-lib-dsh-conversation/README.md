# @playform/ets-lib-dsh-conversation

> v0.2.1 - UNPUBLISHED - plan:
> [RFC-CONVERSATION-SPINE](../../Documentation/Plans/RFC-CONVERSATION-SPINE.md)

## What it owns

The conversation vocabulary and the pure rules, written once for every conversation-aware plugin
(the spine's section 3.1), usable outside the harness entirely:

- **The names.** `service: "conversation"` and the six events `conversation/turn`,
  `conversation/step`, `conversation/call`, `conversation/tool`, `conversation/touch`,
  `conversation/end` - the one place an event name exists.
- **The fold.** A pure function from the session log's records to one session's state: the current
  turn and step, the calls with their usage, the tool calls, the resolved file touches, and the
  distinct files. Relative tool paths resolve against the session header's cwd; a search that names
  a directory is not a file touch; an unknown record shape is skipped without throwing.
- **The touch derivation.** One tool call's name and arguments become the file touches it performs,
  resolved and normalized, shared by the fold and the emission.
- **The emission.** One envelope per state-changing event,
  `{ SessionId, Seq, Turn, Step, At, Kind, Data }`, with `Seq` and `At` copied from the source
  record.

## What it deliberately does not own

The bus, the projection registry, the caching, the lifetime: the harness's `sessionProjections`
subscribes to `session/event` once, folds the registered units, caches, checkpoints, and disposes
with the fiber, and `sessionQuery` reads the cold log. This library owns only the rules the family
would otherwise write three times; the harness keeps the subscription and the subscription's cost.

## The three parts

1. **The library** (this package) - anything pure and shared: the vocabulary, the fold, the parsers.
2. **The provider** (`@playform/ets-plugin-dsh-factory`, `ctx.conversation`) - anything that needs
   the runtime, and the typed adapter for its consumers.
3. **The consumer** - one thin `Source/Conversation/Adapter.ts` per plugin: its own policy only.

The dependency arrow points at the library, never at a sibling: **no plugin imports another
plugin.** A consumer that finds itself writing a second copy of a derivation has found a missing
adapter, and the fix belongs in the provider, not in the consumer.
