# @playform/hook-dsh-comment-filter

A NEW overpass flavor: it strips code comments from `read` and `ccr_retrieve` tool results.

- Listener 1: `tools/post-execute` (prepended) - strips comments from the targeted results.
- Listener 2: `agent/pre-step` - stashes the last user message as the per-task intent.
- Gate: `enabled`, `targets`, `exempt`, the intent keywords (see `Source/Function/Gate.ts`).

The family's overpass arms normalize bytes after the fact; this one OMITS them.

## The deliberate opposite

The normalize flavors exempt `read` as byte-contracted; this flavor TARGETS it.

The omission IS the feature; the exemption list keeps the family's other byte contracts.

Those are `edit`, `raw-write`, `normalize-file`, `subagent` and `ask_user_question`.

## The intent gate

A task ABOUT comments (docstring, jsdoc, license, annotation, ...) keeps them untouched.

Stripping the very bytes a task is asking about would sabotage the task.

The gate runs per call, in order (see `Source/Function/Gate.ts`):

- `enabled` off -> pass; tool not in `targets` -> pass; tool in `exempt` -> pass.
- `intent` off -> strip; task text contains an `intentKeywords` entry -> pass; else strip.
- A step with no user message keeps the previous intent (the gate works past step one).
- `IntentMap` is keyed by the agent object; `Global` is the fallback for a no-agent call.

## The transform

It understands the `read` tool's model-facing envelope byte-for-byte:

```text
<path>{displayPath}</path>
<type>file</type>
<content>
{n}: {line text}
...

(End of file - total N lines)
</content>
```

Every line-number prefix and every line is preserved; an unknown extension passes by identity.

A full-line comment becomes an empty line; a trailing comment is removed from its start.

The scanner is string-aware (quotes with escapes, JS/TS/Go templates, Python docstrings, ...).

Under-stripping is acceptable; corrupting code is not.

Language table: `//` and the slash-star pair for the C family, `#` for the hash family.

`--` for SQL, `--[[ ]]` for Lua, `{- -}` for Haskell/Elm, `;` for Lisp/asm, `%` for TeX.

`<!-- -->` for markup, `#` + `<# #>` for PowerShell, plus Ruby's `=begin`/`=end`.

`md`, `mdx`, `json` and `txt` are deliberately absent. Unknown extensions pass by identity.

v1 blind spots: regex literals, JSX text, Rust raw strings, Lua long strings, shell `${...}`.

## Configuration

```text
logFile         string    ~/.dsh/playform/hook-dsh-comment-filter.log    volatile
log             boolean   true                                          volatile (the ledger gate)
enabled         boolean   true                                          volatile
targets         string[]  ["read", "ccr_retrieve"]                      plain
exempt          string[]  ["edit", "raw-write", "normalize-file", ...]  plain
intent          boolean   true                                          volatile
intentKeywords  string[]  comment, comments, commented, ...             volatile
notice          boolean   true                                          volatile
```

The full `intentKeywords` default list lives in `Source/Variable/Config.ts` (15 entries).

`enabled` is the filter switch only; it maps onto `State.Active`, not the factory's ledger gate
(`State.Enabled`, from the shared `log` cell), so a filter switched off still records its activation
line.

`targets` and `exempt` are structural (editing them remounts); the rest are volatile.

## Ledger strings (byte-exact)

- `hook-dsh-comment-filter: activated (targets 2, intent on, notice on, logFile=...)`
- `hook-dsh-comment-filter: filtered {N} comment(s) in tool result {name} {callId}`
- `(Comments omitted. Use grep to inspect them, or ask the user to include comments.)`

## Activation

The bundle patch is `cordis.patch.yml` (an `- insert:` row).

Activated when the profile's package.json lists it in `dsh.profile.bundles` AND the app restarts.

A `file:` dependency alone is NOT activation; bundle layers compose at host boot.

## Build and verify

```text
pnpm install --offline
cd Classic/packages/hook-dsh-comment-filter
pnpm run prepublishOnly
node Target/Test/Overpass/Test.js   # 19 PASS - Overpass
node Target/Test/Intent/Test.js     # 12 PASS - Intent
```

The per-folder READMEs declare the expected counts (the vacuously-green guard).

The aggregate (`node Maintain/Run-Smokes.mjs`) discovers the folders automatically.
