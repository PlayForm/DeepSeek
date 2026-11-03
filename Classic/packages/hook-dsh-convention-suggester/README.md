# @playform/hook-dsh-convention-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The convention-suggester hook: a DeepSeek Harness plugin that names the companion files of a change
**before** the model forgets them.

The suggestions come from the agent's OWN PREVIOUS TOOL CALLS in this workspace: a
session-projection unit folds every committed `tool/call` into the session's history and, on every
`write`/`edit`/`raw-write` call, the hook names the files that were touched right after this one in
the same session.

A repeated co-touch outranks a single one and a near neighbour outranks a far one, so the notice
carries the workspace's real working set instead of a literal pack:

```text
[convention-suggester] intent=History confidence=0.70
targets (2):
- Source/Library.ts - touched 1 time(s) after this file
- README.md - touched 1 time(s) after this file
note: these files were touched right after this one in this workspace
```

A pack is an **explicit override**, never a fallback: a repository that ships `.dsh/pack.yml` (or a
user-layer pack at `~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `convention/` intents when
the session history is empty. The built-in pack is never consulted, so a workspace with no history
and no pack abstains `abstained no-history  0.00`.

The arbiter is the smoke suite that asserts the behavior
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.4).

The hook is READ-ONLY by design: it never edits, never rewrites arguments, and never denies.

Its only surface is the labeled `additionalContexts` notice.

## The removed learner

The literal pack learner (D4) was **removed**: it is no longer called, writes no proposal, and emits
no `learned proposal` ledger line. The `learning` config field remains in the schema as a retired
compatibility field.

## How it works

1. **The history fold.**

    The fold is a `ctx.sessionProjections` unit (key `conventionHistory`): the registry subscribes
    to `session/event` once and passes every committed event through the unit's `apply`, which turns
    each `tool/call` that names a path into one `Touch` (the sequence number, the normalized path
    and the tool) in that session's cell, capped at 512 touches. Reads count, because every
    committed call is folded.

    The hook holds no subscription of its own: a raw `ctx.on("session/event", ...)` listener
    received nothing in the live harness, and the projection registry is the supported plugin-facing
    form of that seam. The unit is registered through the optional
    `ctx.inject(['sessionProjections'], ...)` form, so a mount without the registry still loads and
    simply has no history.

2. **The post-execute listener.**

    The `tools/post-execute` listener (waterfall, plain registration - after the `{prepend: true}`
    listener of ccr) calls `next()` first.

    Then it resolves the pack-independent workspace root (the nearest ancestor carrying `.git` or
    `package.json`), reads the session history through `stateOf(session, key)`, and runs `Adjacent`
    → existence filter → gate → prepend ONE notice.

    It appends nothing to the history: the current call's `tool/call` is committed before dispatch,
    so the state it reads already carries the anchor's prior touches.

    Content is never replaced.

3. **The pre-step listener.**

    The `agent/pre-step` listener resets the note counter each turn when a user message enters.

The registered listener list is exactly `loader/volatile-update`, `tools/post-execute` and
`agent/pre-step`; the projection unit registers separately, on `ctx.sessionProjections`.

## The plan

PoC phase: the package and Source are complete, and the smoke suites, the build pass, and the wiring
are the end-phase (POC-BRIEF.md §8).

The four smoke folders are `Pack-Driven` (5), `Post-Execute-And-Gate` (18), `Wiring-And-Ledger` (14)
and `Workspace-Gate` (6), for 43 PASS in total.

Ships `enabled: false` in the bundle patch.

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - §9.4, the
  convention arbiter.

## License

CC0-1.0.
