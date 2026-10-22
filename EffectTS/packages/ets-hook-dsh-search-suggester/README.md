# @playform/hook-dsh-search-suggester

The search-intent **target suggester** for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release). A DeepSeek Harness plugin that hooks the **`tools/post-execute` waterfall** and, when a
search-class call (`grep`, `glob`, `read`, or a search-shaped `bash`) matches one of the ten intent
kinds, prepends ONE labeled `additionalContexts` note naming the likely target set - the standard
locations where that intent lives in this repo - **before** the model burns the searches. Plan:
[SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md).

## Why

In the measured sessions, 46% of every tool call is a search-class call, and the discovery is late:
in the release lane only 6% of the files the model eventually edited had been read before its first
edit. The repetition is not mostly literal - it is semantic: the same intent reached through a dozen
different literals and a hundred different paths. The deliverable is not a better search; it is a
**target set**: a compact, ordered, intent-keyed list of the standard locations, delivered at the
first call of an intent.

## The intents

Ten kinds, priority order (destructive first): `Version`, `Path`, `Ledger`, `Config`, `Dependency`,
`Test`, `Symbol`, `Doc`, `Usage`, `Owner`. Each kind is a pack row: its signal table (regex rules
with weights), its per-intent threshold (`0.85` for the destructive `Version`/`Path`/`Ledger`,
`0.75` for the rest), and its ordered candidate set - each candidate a path or glob with a prior and
**one reason phrase** ("the monorepo manifest", "the const Version", "the build mirror - never
edit"). A candidate without a reason is not emitted.

## The gate

`k = sigmoid(sum(weights) + b)`, `b = -0.6`, so a single weak signal never crosses the default
threshold. The noise control: a cooldown (no second note for the same intent within
`cooldownCalls`), a dedupe (the same intent + candidate set is one note), a per-turn cap
(`maxNotesPerTurn`), and the already-recent filter. Every abstention and suppression is a ledger
line, so the precision is measured, not assumed. The algebra's identity element is silence.

## The delivery

One note, never a content replacement: the post-execute listener runs AFTER the ccr's
`{prepend: true}` listener and only adds `additionalContexts`, so a ccr-compressed result is
unaffected. The note carries the plugin's own source label
(`{kind: "search-suggester", form: "notice", summary}`) - an unlabeled context would render as a
user prompt in derived history. The optional second surface (`sectionMode: "sticky"`, off by
default) is one `system-prompt/assemble` section carrying the current intent's target list, rebuilt
on a TTL and invalidated on `tools/change`.

## The learning

Online only, in this PoC: after a note, a candidate the model actually touches within the window is
a `followed` (counts move, the journal closes); an untouched window closes as `ignored`. The
knowledge file (`persistPath`, `~/.dsh/search-suggester/knowledge.json`) is written atomically
(temp + rename, mode 0600) and bounded; a corrupt file degrades to the cold start - the static pack
alone is enough to emit. The offline seed and the generated repo index
(`Maintain/Index-Search-Targets.mjs`, `indexPath`) are the end-phase.

## The waterfall discipline

`next()` is always awaited first; pass-through returns the downstream decision unchanged; the whole
transform is fail-open (an internal error logs a warning and the decision passes through - a note
never fails a tool call); plain registration, after the ccr and the normalize family. The
`write`/`edit`/`raw-write` calls are learning signals only - a note after the edit is too late.

## Config

See [SCHEME.md](./SCHEME.md) for the full schema. Every tuning knob is volatile (hot-editable, no
remount); the structural knobs (`persistPath`, `indexPath`, `refreshOnBoot`) remount on edit. Ships
**disabled** - enable by explicit ACTIVATE in the profile.

## License

CC0-1.0.
