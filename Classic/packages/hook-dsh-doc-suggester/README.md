# @playform/hook-dsh-doc-suggester

The doc-task **companion suggester** for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin
family (the Classic release). A DeepSeek Harness plugin that hooks the
**`tools/post-execute` waterfall** and, when a call touches a documentation
task - a plan, guide, skill, plugin-doc, index, site, or package-prose path
in `read`, `grep`, `glob`, or an edit - prepends ONE labeled
`additionalContexts` note naming the doc-graph companions the task
conventionally requires: the INDEX row, the frontmatter statuses/registry/
index block, the archive style, the cross-references, the site mirror. The
third consumer of the search-suggester's pattern algebra
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)
section 8).

## Why

The documentation tree has a graph the model must keep coherent but usually
discovers late: a plan edit must keep the INDEX row and the frontmatter
statuses/registry/index block; a skill must keep its references and the
session-orientation routing table; a content change must keep the site
mirror. Like the edit suggester, this consumer owns the NOTIFY side of the
pattern: it names the companions, never the change.

## The families

Seven, priority order: `Plan`, `Guide`, `Skill`, `PluginDoc`, `Index`, `Site`,
`PackageProse`. Each family is a pack row: its path rules (regexes on the doc
path the call names, with weights) and its companion set - each companion a
path or glob with a prior and **one reason phrase** ("the index row", "the
frontmatter and style rules", "the site mirror"). A companion without a
reason is not emitted.

## The gate

The same algebra as the search and edit consumers: `k =
sigmoid(sum(weights) - 0.6)`, the candidate scoring with a neutral history
(this PoC carries no learned layer), and the noise control - a cooldown, a
dedupe, a per-turn cap, and the already-touched filter (doc paths touched
earlier this turn are dropped; when nothing remains, the verdict is an
`already-touched` abstention). Every abstention and suppression is a ledger
line.

## The delivery

One note, never a content replacement: the post-execute listener runs after
the ccr and the normalize family and only adds `additionalContexts`. The note
carries the plugin's own source label (`{kind: "doc-suggester", form:
"notice", summary}`). The judged tool set is config (`tools`): the read and
search calls that touch documentation plus the edits that land on it.

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
