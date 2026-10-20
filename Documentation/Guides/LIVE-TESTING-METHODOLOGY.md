# Live-Testing Methodology - the Family Test Loop (2026-10-19)

> A framework for LIVE-TESTING the DSH plugin family from a NEW conversation
> (e.g. after restarting the app and opening a conversation in the DeepSeek
> folder), WITHOUT restarting the app between tests. The loop: toggle a
> setting -> launch a quick low-effort subagent with a mock execution task ->
> observe the feedback (ledgers + transcript) -> tune the knobs -> verify.

## 1. THE LIVE-RELOAD TRUTH TABLE (what is live, what needs a restart)

| Change | Applies | Mechanism |
| --- | --- | --- |
| Volatile knobs (`scopes.*`, `thresholdBytes`, `multipliers`, `previewMaxChars`, `replacement`, `normalizeReasoning`, `normalizeToolArguments`, tool-coach `enabled`/`enforce`/`threshold`/`window`/`cooldown`/`patternTable`/`notes.*`/`fetchLive`/`maxSectionTools`/`sectionTtl`, ccr `thresholdBytes`/`multipliers`, the `log` cells) | **LIVE** - next use, no remount, no new activation line | the `loader/volatile-update` in-place refresh (landed in HEAD - both factories, `State.ts`) |
| Plain/structural fields (`targets`, `exempt`, `toolResultsExempt` array, `journalPath`, `autoExpand`, `autoExpandLimitBytes`, `ttlSeconds`, `storeBudgetBytes`) | **LIVE** - via the loader's update flow (re-apply/remount; a new activation ledger line appears) | `internal/update` (the tutorial 05-config ordinary-field flow) |
| Loader-level `disabled: true` (the control-panel rows) | **LIVE via `plugin_manager`** `set_plugin` (empirically proven 2026-10-19: enabling `include:plugin-dsh-factory` + `include:hook-dsh-normalize-file` applied immediately - `fiberPhase: active` + the `normalize-file` tool appeared in the live registry, no restart). CAVEATS: (a) target = the EXACT entryId WITH the `include:` prefix (`include:hook-dsh-normalize-file`, not the bare id); (b) DEPENDENCY ORDER - the hooks wait for the factory's `pluginFactory` service, so enabling a hook while the factory is disabled leaves it `pending (waiting for service: pluginFactory)` - enable the factory first; (c) direct patch-file edits are picked up at the next mount/boot. | plugin_manager + the loader's mount decisions |
| Profile structural changes (adding/removing bundles in `package.json` `dsh.profile.bundles`, new plugin installs) | **RESTART** required (bundle layers compose at boot) | - |

**The loaded-but-not-running posture (the user's ask):** YES, it exists:
- the tool-coach: `enabled` (volatile master switch) - the plugin loads, its
  listeners register, but every path no-ops (`if (!State.On)`, ledger line
  `disabled (enabled=false)`);
- the normalize hooks: no single master - the per-scope gates
  (`scopes.conversation/reasoning/toolInput/toolResults/batch/files`) make
  each behavior inactive independently;
- the loader-level `disabled` (composition) is the whole-plugin switch - flip
  it via `plugin_manager` at runtime.
Recommended posture for testing: keep the loader rows `disabled: false`
(loaded), and toggle behavior via the volatile knobs (or the tool-coach
`enabled` master) - zero restarts.

## 2. THE PER-PLUGIN TEST LOOP

For EACH plugin under test, run this loop:

1. **Baseline**: `tail` the plugin's ledger (`~/.dsh/<plugin>.log` - the
   family's "one log per module"; the durable `[ISO]` lines) + note the
   activation line.
2. **Toggle/knob**: change a volatile knob via the in-app settings/config
   editor (the live `ctx.configEditor` path - writes the patch under lock) OR
   directly in `~/.dsh/profiles/desktop/cordis.patch.yml` (the control-panel
   rows own the whole config). Volatile = next use picks it up.
3. **Probe**: launch a QUICK LOW-EFFORT SUBAGENT (`glm-5.3-flash` low) with
   a plugin-specific MOCK EXECUTION TASK (the library below). The subagent
   performs the task exactly (the mock task must trigger the plugin's
   behavior deterministically) and reports what it did + what it observed.
4. **Observe**: check the plugin's ledger (new lines), the transcript (the
   subagent's turn), and `plugin_manager` state where relevant.
5. **Tune**: adjust the knob per the feedback; repeat 2-4 until the behavior
   matches the smoke-proven semantics.
6. **Verify**: re-run the plugin's smoke suite (`node <tree>/smokes/
   <plugin>-smoke.mjs`) to confirm the live behavior matches the arbiter.

## 3. THE MOCK-TASK LIBRARY (one per plugin)

| Plugin | Mock execution task (the subagent's job) | What to observe |
| --- | --- | --- |
| `plugin-dsh-factory` | any tool-API write (write/edit) in the DeepSeek folder | the governor/pinner ledger events + the activation line |
| `hook-dsh-package-governor` | write a `package.json` with a stale pin (e.g. bump a dep version) | the governor's `update` stage in `~/.dsh/governor.log` (ncu re-bump) |
| `hook-dsh-package-pinner` | same; then check the pins after the write | pinner ledger: pins restored/held |
| `hook-dsh-cargo-governor` | edit a `Cargo.toml` in the Aphrodite folder | cargo-governor ledger (cargo update stage) |
| `hook-dsh-normalize-file` | `write` a file containing `…`/em dashes/curly quotes, then call `normalize-file` on it | the file bytes + `normalize-file.log` count line |
| `hook-dsh-normalize-{dash,ellipsis,quotes,spaces,invisible,fullwidth}` | enable the plugin + its scope; ask the subagent to produce output containing the char class (e.g. write a message with U+2026) | the stream output in the transcript (literal vs normalized) + the plugin ledger |
| the `scopes` surface | flip `scopes.conversation` false vs true; same probe as above | the SAME model message renders differently per flip - NO restart between flips |
| `hook-dsh-ccr` | run a bash command producing a large output (>102400 B, or set `autoExpandLimitBytes` low) | `~/.dsh/ccr.log` stored/compressed lines + the marker in the transcript + `ccr_retrieve` round-trip |
| `hook-dsh-tool-coach` | run a `sed -i` / `cat <file>` bash command | the coach ledger (offense/strike lines) + the notice in the transcript (tier 1) + the persistent section (tier 2 after 6 strikes) + the deny (tier 3 with `enforce: write`) |

## 4. THE SUBAGENT PROTOCOL

- Route: `cloudflare-workers-ai` / `@cf/zai-org/glm-5.3-flash` / `low`
  (quick + cheap; correctness is verified by the deterministic observations).
- The prompt: SELF-CONTAINED (the subagent sees no session context): the
  exact mock task, the exact commands/files, and a report format ("what I
  did; what I observed; the exact outputs"). Instruct it to use the harness
  TOOLS (never bash content edits) so the governed chain fires.
- One subagent per probe; the parent (the testing LLM) reads the ledgers
  afterwards - never trust the subagent's prose over the ledgers.

## 5. THE OBSERVATION SURFACES

- `~/.dsh/<plugin>.log` - the per-module ledgers (activation + behavior lines).
  **LIVE-BATTERY FINDING (2026-10-19)**: the ledger writer does NOT resolve `~`
  in `logFile` config values - a `logFile: ~/.dsh/x.log` silently fails to
  write (no file, no error). ALWAYS use absolute paths
  (`/Users/nikola/.dsh/x.log`) in the profile config rows. (The Classic bundle
  patches' own `~/.dsh/...` logFile defaults carry the same latent issue when
  running live - a future family fix.)
- `~/.dsh/governor.log`, `pinner.log`, `cargo-governor.log` - the governance
  trail (update stages, pins).
- `plugin_manager` list_plugins - enabled/fiberPhase per entry (the entryId
  carries the `include:` prefix; `fiberPhase: active` = running, `null` =
  pending/disabled).
- The GUI transcript - the model-visible effects (notes, markers, denials).

## 6. THE CONVERSATION STARTER (paste into the new conversation)

```
You are the LIVE-TESTER of the PlayForm DeepSeek plugin family (2026-10-20
state). The profile (desktop) carries 13 @playform bundles - the factory,
the package-governor, the package-pinner, the cargo-governor, the
normalize-file + the six stream flavors, the ccr, and the tool-coach - ALL
ENABLED by default; the live-containers plugin is intentionally NOT in the
profile (the IDLE-forever posture - do not wire it). The control surface:
the plugin_manager tool (set_plugin include:<entryId> enabled true|false -
LIVE, no restart; the exact entryIds with the include: prefix: the hooks
pend on the factory's pluginFactory service - enable the factory first) +
the volatile config cells (hot-edit via the GUI config editor or the
config-editor surface - the loader/volatile-update refresh applies them
live, no remount; the plain/structural fields re-apply on the next use).
The observation surfaces: the ledgers (~/.dsh/hook-dsh-*.log + the
normalize-family ledgers + the tool-coach ledger - the activation lines
prove the mount; the live flips land "without remount"), the plugin_manager
list (the fiberPhase), and the GUI. THE LOOP per plugin: record the baseline
ledger -> toggle the knobs (ON/OFF, before and after a turn - watch the
ledger's activation/refresh lines + the behavior) -> launch a glm-5.3-flash
low subagent with the plugin's mock task from the mock-task library (the
methodology section 3) -> read the ledgers/transcript -> tune -> verify with
the plugin's smoke (the per-test folders; the runner: Maintain/Run-Smokes.mjs
- "All 207 smoke suites passed"). Never restart the app mid-loop; a restart
is needed ONLY for profile-structural changes (the restart matrix, section
7). Report per-plugin results + the final knob state.
```

## 7. THE RESTART MATRIX (when a restart IS required)

- Adding/removing a plugin from `dsh.profile.bundles` (package.json).
- First-time activation of an entry the loader has never mounted (or if
  `plugin_manager` is unavailable in the conversation).
- Any profile structural change (new patch rows for plugins not yet loaded).
Everything else - knobs, scopes, masters, enforce tiers, plain-field
re-applies - is live.