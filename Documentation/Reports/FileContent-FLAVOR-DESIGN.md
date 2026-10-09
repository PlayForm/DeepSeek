# FileContent-FLAVOR-DESIGN - Register Item #7: The File-Content Normalizer Flavor

> One of the four research reports migrated from the pre-restructure flat documentation folder — see also
> `../Handoff/Register.md` (item #7) and `../Handoff/Packages/Package-13.md` (the normalize-file
> bundle that shipped from this design).

> Research report (read-only; nothing committed). Register item, verbatim: "The file-content
> normalizer flavor - the hermes heritage: rewriting family characters in files ALREADY on disk
> (beyond the tool layer)."

## 1. The hermes heritage (the ancestry)

Three sibling hooks live at `~/.hermes/agent-hooks/`:

### `normalize-dashes.sh` - the direct ancestor of the dash flavor

- **Trigger**: a Hermes post-tool-call hook; stdin JSON, path read from `.tool_input.path` (the
  write/patch tool's payload).
- **Scope**: that ONE file, only if it exists and `file --brief --mime-encoding` says non-binary.
- **Transform**: `perl -i -CSD -pe` with the unicode dash class
  (`U+058A 05BE 1400 1806 2010-2015 2E17 2E1A 2E3A-2E3B 2E40 2E5D 301C 3030 30A0 FE31-FE32 FE58 FE63 FF0D`
  → `-`) - in place, no context rules.
- Already inherited by `dsh-normalize-dash-hook` at the model-output layer (its `SCHEME.md` §1 is
  the regex verbatim).

### `normalize-dashes-for-execute-code.sh` - the gap this register item names

- **Trigger**: post-tool-call for `execute_code`, path from `.cwd`.
- **Scope**: `find "$CWD" -maxdepth 1` over a fixed extension allowlist
  (ts/tsx/js/json/yaml/toml/md/rs/py/c/h/sh/astro/css/html/xml/ini/env...), binary files skipped;
  same perl substitution.
- **Why it exists**: files created _inside_ scripts (`write_file()`, `open()`) never pass through
  the write tool, so the primary hook never saw them. This is exactly "files ALREADY on disk, beyond
  the tool layer."

### `normalize-tabs.sh` - the cautionary tale

- Exists because Hermes' patch tool corrupted indentation (`\t` written literally); a second hook
  repaired the first layer's collateral damage.
- **Lesson**: Hermes' after-the-fact file rewriting demonstrably fought the tool layer and needed
  repair hooks. DSH's edit tool is stricter (byte-exact `old_string`), so the same shape is _more_
  dangerous here.

**What the DSH flavor should inherit**: the binary skip; the extension-scoped sweep idea (as an
explicit tool's optional scope, not a daemon); the transform set (already in the core); and the
_inversion_ of the trigger - Hermes rewrote silently after the fact; DSH should make it an explicit,
visible, opt-in tool call.

## 2. The current state (what already covers file-content normalization)

| Mechanism                          | Where                                                                           | Covers                                                                        | Limits                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `raw-write` tool `normalize: true` | `bundles/dsh-normalize-dash-hook/Source/Function/Write.ts`, `Rewrite.ts`        | content **being written now**, all six transforms through the shared executor | explicit per-call opt-in; default verbatim; new writes only |
| Six stream flavors                 | `bundles/dsh-hook-normalize-{dash,quotes,...}`                                  | **model output** only (llm/stream waterfall)                                  | never touches disk                                          |
| Governance trio                    | `bundles/dsh-hook-{package-governor,package-pinner,cargo-governor}`             | governed manifests, their own rewrites                                        | not the family's six transforms                             |
| Edit exemption                     | `bundles/dsh-core-hook/Source/Stream/Chunk.ts` (name-exempt `edit`/`raw-write`) | protects the old_string contract                                              | _defines_ the conflict surface below                        |

**Not covered**: any file already on disk that the agent did not just write - pre-existing files,
git-cloned material, script-created files (the execute-code gap). No mechanism rewrites those today,
by design.

## 3. The design space

### (a) A `normalize-file` tool - the raw-write pattern

- **Trigger**: the agent calls the tool with a `file_path`.
- **Flow** (mirrors `Write.ts:113-130`): `ctx.fs.resolve` → `ctx.fs.readText` (count) → if N > 0,
  one `Factory.Write(State, target, normalized, { actor: exec, policy: "standing" })` → outcome; if
  N = 0, **no write at all**.
- **Scope**: one agent-chosen file; binary/undecodable → error result, no write (the hermes mime
  check, tool-shaped).
- **Transform**: all six (the `Rewrite` chain, `Rewrite.ts:34-50`), with a `replacement` config knob
  for the dash step.
- **Ledger**: `normalize-file: normalized N char(s) in <path>` (N > 0 only).
- **Safety**: explicit, visible (diff card from the outcome's before/after), discoverable, zero
  background activity. Small delta over raw-write.

### (b) An event-driven rewriter (`fs/observed` listener)

- **Trigger**: every `fs/observed { kind: "present" }` - i.e. every write by any actor.
- **Fatal problem 1 - the edit contract**: the exemption works _only because files are not rewritten
  behind the agent_ (`Chunk.ts:19-28`; live-proven, the Handoff's
  [Package 12](../Handoff/Packages/Package-12.md) — the edit-exemption live findings). A background
  rewriter invalidates every subsequent `edit` old_string on the same file: the agent read bytes X,
  the rewriter silently changed them to X′, the edit fails or half-matches. This is the live lesson
  that made raw-write's verbatim default the right call.
- **Fatal problem 2 - the governance loop**: a rewrite of `package.json` re-emits `fs/observed` →
  re-triggers the governor's bounded pass. The Stash idempotence gate (factory `SCHEME.md` §2.6)
  bounds the governor's _own_ same-actor re-emits, but a second rewriter sharing the event stream is
  a new actor interleaving with the bounded passes - untested territory.
- **Fatal problem 3 - hermes precedent**: `normalize-tabs.sh` is what happens when
  layer-after-the-fact meets layer-with-expectations.
- **Verdict: not advisable now.** No design on the table makes background rewriting safe for the
  edit contract.

### (c) A hybrid (tool + opt-in watch)

- The watch arm inherits every (b) problem; opt-in only changes who is surprised. **Ship the tool
  arm; defer the watch arm** until an edit-contract mechanism exists (e.g. edit consuming a
  version/normalization stamp - a harness-side change, out of family scope).

## 4. The conflict map (against recommendation (a))

| #   | Surface                     | Analysis for the tool                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| i   | Governance bounded passes   | The write goes through `Factory.Write` → `fs/observed` emit, but the governor Gate's actor check (`SCHEME.md` §2.6) requires the actor tool name ∈ `mutationTools`; all three governors pin `[write, edit, str_replace_editor]` (their `cordis.patch.yml`), so `normalize-file` writes never pass - no chain pass, no loop, same protection raw-write already has. **Rule: never add `normalize-file` to any `mutationTools` list.** |
| ii  | Edit old_string contract    | Safe _because visible_: the tool result's diff shows before/after in the same turn (the raw-write `normalize: true` posture). The agent must re-read before editing - same obligation as after any normalize:true write. Document in the tool description.                                                                                                                                                                           |
| iii | raw-write read-before-write | Tool calls are serialized; `Factory.Write`'s `before` is read at write time, so a prior normalize-file in the same turn is already reflected. No race.                                                                                                                                                                                                                                                                               |
| iv  | P5 single-open domain       | Each module opens its own `package_governance` sink (`Factory` `Function/Open.ts`); the flavor journals via its own `Attach`. The `normalized` event name requires the domain version bump (register item #8, in flight by another agent) - sequence the Journal calls behind that enum, or ship without journaling first.                                                                                                           |
| v   | Exclusion list              | Not needed for a single-file tool (no walk). The core's list (`bundles/dsh-core-hook/Source/Variable/Default.ts`: `node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app`) applies only if the deferred watch arm is ever built; any future watch must also add the governed manifests (`package.json`, `Cargo.toml`, lock files).                                                                                           |

## 5. Recommendation

**Ship (a): a `normalize-file` tool as a new bundle `dsh-normalize-file-hook`, an eighth sibling in
the normalize family. Defer (b)/(c)'s watch arm - the edit-contract conflict is unsolved and the
family has no mechanism for it.** The tool layer (raw-write) covers writes; this covers "already on
disk"; the background rewrite stays out.

### Coder spec shape (the family's exact pattern)

- **Bundle dir**: `~/.dsh/profiles/desktop/bundles/dsh-normalize-file-hook/`, files cloned from
  `dsh-normalize-quotes-hook` (the plain flavor) minus the stream machinery: `package.json` (name
  `@playform/dsh-normalize-file-hook`, `main ./Target/Library.js`, exports incl.
  `./cordis.patch.yml` + `./SCHEME.md`, `prepublishOnly` script and devDeps verbatim from
  `dsh-normalize-dash-hook/package.json`, `dsh.bundle.patch` key), `cordis.patch.yml`, `SCHEME.md`,
  `README.md`, `tsconfig.json`, `Configuration/{ESBuild.ts,TypeScript.noemit.json}`.
- **Source files**:
    - `Source/Library.ts` - loader contract (`name`/`apply`/`Config`/`inject` all on the default
      object - the live pitfall, `Library.ts:1-11`); `inject: ["pluginFactory", "fs", "tools"]`;
      module name `normalize-file`.
    - `Source/Variable/Config.ts` - `Factory.Schema(false, {...})` (minimal shared block, no
      fs/observed fields): `logFile` (`/Users/nikola/.dsh/normalize-file.log`, volatile),
      `replacement` (`"-"`, volatile), nothing else.
    - `Source/Function/Rewrite.ts` - the six-transform chain via the core's public
      `Replace`/`ReplaceMap` + tables (same order as
      `dsh-normalize-dash-hook/Source/Function/Rewrite.ts`), plus a counting variant (sum the core's
      `{ text, count }` counts) for the ledger.
    - `Source/Function/File.ts` - the tool (`defineTool` from `@deepseek-ai/dsh-tools`): params
      `file_path` (required); exec = resolve → `ctx.fs.readText` → count → N=0: return
      `{ path, count: 0, changed: false }` **without writing**; N>0:
      `Factory.Write(State, target, normalized, { signal: exec.signal, actor: exec, policy: "standing" })`;
      decode failure/binary → error result; presenters: `presentResult` diff card from the outcome's
      before/after.
    - `Source/Function/Apply.ts` - `Factory.State` (fields `{ Replacement: "replacement" }`) →
      `Factory.Append(Activate([...]))` → `Context.tools.register(File(Context, State))` → **no**
      `Context.on` of any kind (the first flavor with no stream listener); attach State via
      `ctx.__normalizeFileState` for the smoke; optional `Factory.Attach` +
      `Factory.Journal("normalized", path, "N char(s)")` once register item #8 lands the enum.
- **Stream-gate addition (small, in the core)**: add `"normalize-file"` to the name-exempt list in
  `bundles/dsh-core-hook/Source/Stream/Chunk.ts` (and `Stream/Block.ts`) beside `edit`/`raw-write` -
  its args carry a _path_; normalizing a dash inside a filename would corrupt the target.
- **Profile wiring**: `~/.dsh/profiles/desktop/package.json` - bundles list +=
  `@playform/dsh-normalize-file-hook`, dependencies += `link:` entry; `cordis.patch.yml` (the
  bundle's own) - `insert:` with `id: normalize-file`,
  `config: { log: true, logFile: ..., replacement: "-" }`. No top-level profile patch entry needed
  (defaults are already "for me").
- **Ledger strings** (asserted by the smoke):
  `normalize-file: activated (replacement=-, logFile=...)` /
  `normalize-file: normalized 3 char(s) in /abs/path` (N > 0 only; no line for a no-op).
- **Smoke** (`/tmp/normalize-file-smoke.mjs`, fake ctx + real factory, the family's shape): entry
  contract; registration in the tools registry; fixture file with all six families → exec → bytes
  match the chain, count and ledger line asserted; clean file → no write (mtime unchanged), no line;
  undecodable content → error result, no write; `Factory.Write` pipeline assertions (waterfall
  called, standing policy, fs/observed emit).
- **Defaults**: ON for the _tool's existence_ (it is inert until called - the per-call opt-in is the
  design), OFF/absent for any future watch. This matches the user's "just for me, defaults off"
  precedent: nothing runs without an explicit agent action.

## 6. Verdict summary

- The hermes heritage is three hooks: the transform (inherited), the execute-code gap (this item's
  real target), and the tabs cautionary tale (why background rewriting is rejected).
- Today only raw-write `normalize: true` touches disk, and only for new writes; nothing covers files
  already on disk.
- `normalize-file` (tool) is safe by the same mechanisms that make raw-write safe: explicitness,
  visibility, the actor gate, and the no-op no-write rule.
- An `fs/observed` rewriter is **not advisable now**: it breaks the edit old_string contract (the
  live lesson) and interleaves with the governors' bounded passes. Revisit only with a harness-side
  edit-contract mechanism.
