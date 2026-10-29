# @playform/hook-dsh-comment-filter

This is a NEW overpass flavor, and it strips code comments from the `read` and `ccr_retrieve` tool
results.

- Listener 1 is `tools/post-execute` (prepended), which strips comments from the targeted results.
- Listener 2 is `agent/pre-step`, which stashes the last user message as the per-task intent.
- The gate reads `enabled`, `targets`, `exempt`, and the intent keywords in
  `Source/Function/Gate.ts`.

The overpass arms of the family normalize bytes after the fact, and this one OMITS them.

## The deliberate opposite

The normalize flavors exempt `read` as byte-contracted, and this flavor TARGETS it.

The omission IS the feature, and the exemption list keeps the other byte contracts of the family.

That list is `edit`, `raw-write`, `normalize-file`, `subagent`, and `ask_user_question`.

## The intent gate

A task ABOUT comments (docstring, jsdoc, license, annotation, ...) keeps them untouched.

Stripping the very bytes a task is asking about would sabotage the task.

The gate runs per call and in order, as `Source/Function/Gate.ts` shows:

- An `enabled` of off passes, a tool outside `targets` passes, and a tool in `exempt` passes.
- An `intent` of off strips, task text with an `intentKeywords` entry passes, and everything else
  strips.
- A step with no user message keeps the previous intent, so the gate works past step one.
- `IntentMap` is keyed by the agent object, and `Global` is the fallback for a no-agent call.

## The transform

The transform understands the model-facing envelope of the `read` tool byte-for-byte:

```text
<path>{displayPath}</path>
<type>file</type>
<content>
{n}: {line text}
...

(End of file - total N lines)
</content>
```

Every line-number prefix and every line is preserved, and an unknown extension passes by identity.

A full-line comment becomes an empty line, and a trailing comment is removed from its start.

The scanner is string-aware for quotes with escapes, JS/TS/Go templates, Python docstrings, and
similar forms.

Under-stripping is acceptable, and corrupting code is not.

The language table gives `//` and the slash-star pair for the C family and `#` for the hash family.

It gives `--` for SQL, `--[[ ]]` for Lua, `{- -}` for Haskell/Elm, `;` for Lisp/asm, and `%` for
TeX.

It gives `<!-- -->` for markup, `#` plus `<# #>` for PowerShell, and the `=begin`/`=end` pair of
Ruby.

`md`, `mdx`, `json` and `txt` are deliberately absent.

Unknown extensions pass by identity.

The v1 blind spots are regex literals, JSX text, Rust raw strings, Lua long strings, and shell
`${...}`.

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

The full default list of `intentKeywords` lives in `Source/Variable/Config.ts` with 15 entries.

`enabled` is the filter switch only, and it maps onto `State.Active` rather than the ledger gate of
the factory (`State.Enabled`, from the shared `log` cell), so a filter that is off still records its
activation line.

`targets` and `exempt` are structural, because editing them remounts, and the rest are volatile.

## Ledger strings (byte-exact)

- `hook-dsh-comment-filter: activated (targets 2, intent on, notice on, logFile=...)`
- `hook-dsh-comment-filter: filtered {N} comment(s) in tool result {name} {callId}`
- `(Comments omitted. Use grep to inspect them, or ask the user to include comments.)`

## Activation

The bundle patch is `cordis.patch.yml`, which holds an `- insert:` row.

The package activates when the profile package.json lists it in `dsh.profile.bundles` AND the app
restarts.

A `file:` dependency alone is NOT activation, because bundle layers compose at host boot.

## Build and verify

```text
pnpm install --offline
cd Classic/packages/hook-dsh-comment-filter
pnpm run prepublishOnly
node Target/Test/Overpass/Test.js   # 19 PASS - Overpass
node Target/Test/Intent/Test.js     # 12 PASS - Intent
```

The per-folder READMEs declare the expected counts, which is the vacuously-green guard.

The aggregate at `node Maintain/Run/Smokes/Index.mjs` discovers the folders automatically.
