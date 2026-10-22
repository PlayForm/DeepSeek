# @playform/hook-dsh-edit-suggester

The modification-intent **companion suggester** for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin
family (the Classic release). A DeepSeek Harness plugin that hooks the
**`tools/post-execute` waterfall** for the modification tools (`write`,
`edit`, `raw-write`) and, when the edited path matches one of the convention
families, prepends ONE labeled `additionalContexts` note naming the standard
companions the model has not touched yet - **"this file rarely stands
alone."** The second consumer of the search-suggester's pattern algebra and
its two-consumer extraction trigger
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)
sections 1.4 and 8).

## Why

The search-suggester's evidence shows the edit is where the discovery
happens: the model edited its way to the target sets it never thought to
open. The repo's convention is that a file rarely stands alone - the version
lives in 36 manifests, 6 `Apply.ts` files, the CHANGELOG and the prose; a
`Config.ts` edit must also land in the README's Config section, SCHEME.md,
the `cordis.patch.yml` row, and the byte-exact test. The search consumer
deliberately refuses to own the edit transform; this consumer owns the
NOTIFY side of it: it names the companions, never the change.

## The families

Seven, priority order: `Version` (0.85 - a wrong version companion set is
costly), `Config`, `Symbol`, `Test`, `Doc`, `Prose`, `Workflow`. Each family
is a pack row: its path rules (regexes on the edited path with weights) and
its standard companion set - each companion a path or glob with a prior and
**one reason phrase** ("the Config section", "the byte-exact assertion", "the
long tail"). A companion without a reason is not emitted.

## The gate

The same algebra as the search consumer: `k = sigmoid(sum(weights) - 0.6)`,
the candidate scoring with a neutral history (this PoC carries no learned
layer), and the noise control - a cooldown, a dedupe, a per-turn cap, and
the already-touched filter (companions the model edited earlier this turn
are dropped; when nothing remains, the verdict is an `already-touched`
abstention). Every abstention and suppression is a ledger line.

## The delivery

One note, never a content replacement, never a claim of the Transform: the
post-execute listener runs after the ccr and the normalize family and only
adds `additionalContexts`. The note carries the plugin's own source label
(`{kind: "edit-suggester", form: "notice", summary}`). The
`grep`/`read`/`bash` calls are not judged - this is the edit side of the
family, disjoint from the search suggester's trigger set.

## The waterfall discipline

`next()` is always awaited first; pass-through returns the downstream
decision unchanged; the whole transform is fail-open (an internal error logs
a warning and the decision passes through - a note never fails a tool call).

## Config

See [SCHEME.md](./SCHEME.md) for the full schema. Every knob is volatile
(hot-editable, no remount). Ships **disabled** - enable by explicit ACTIVATE
in the profile.

## License

CC0-1.0.
