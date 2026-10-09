# DOGFOOD-TESTING - The `~/.dsh` Integration-Test Specialization

> Status: **PLAN** (documentation only; no code, no installs executed).
> Scope: extend the family's test coverage from the 24 fake-ctx smokes to the
> LIVE harness runtime, using a **scratch profile** that installs this
> monorepo's packages with **NO SYMLINKS**. The user's real profiles
> (`~/.dsh/profiles/desktop`, `~/.dsh/profiles/web`) are READ-ONLY throughout.

---

## 1. What the current smokes cover - and what they cannot

### 1.1 The current 24 suites (the mechanics arbiter)

Twelve suites per tree (`Classic/smokes/` 733 checks, `EffectTS/smokes/` 746
checks), run with `node <name>-smoke.mjs`:

| Suite (both trees) | Classic | EffectTS | Proves |
|---|---|---|---|
| core-smoke | 14 | 17 | pure helpers, update envelope, raw-write exemption |
| factory-smoke | 34 | 41 | services, layers, GuardedWrite, both P4 postures |
| governor-smoke | 78 | 81 | chain pass, refusal guard, task-owned writes |
| pinner-smoke | 32 | 32 | version-guard pipeline, real-token fs |
| cargo-smoke | 62 | 62 | cargo flavor wiring, FS_STALE_VERSION propagation |
| normalize-dash-smoke | 132 | 132 | dash stream + fs/tools/waterfall seams, abort path |
| quotes / ellipsis / spaces / invisible / fullwidth (5 × 62) | 310 | 310 | flavor tables + stream capture |
| normalize-file-smoke | 71 | 71 | the six-transform family normalize, ledger lines |

The harness pattern: the REAL built `Target/Library.js` + the REAL factory
against a FAKE ctx (capture seams: on/emit/effect/get/reflect/fs/waterfall/
logger, the `root` seam, the `__<name>State` probes). The ledger strings are
the byte-identical contract.

### 1.2 The gaps vs the LIVE harness runtime (the smoke/live fidelity gap, itemized)

The smokes prove the **mechanics**; they do NOT prove the **wiring**. Untested
today, and precisely what dogfooding must cover:

1. **Profile assembly** - the `dsh.profile.bundles` list, the load ORDER
   (live: the pinner activates before the governor at boot), the
   `node_modules` resolution inside a profile.
2. **The patch layers** - `cordis.yml` (empty root) + `cordis.patch.yml`
   (the effective config replaces the entry config wholesale) + the
   `$DSH_HOME/cordis.patch.yml` home-level patch.
3. **The real fs/observed chain** - the fake-ctx seams approximate the
   harness's `fs/observed` events; the live event loop, the interception
   layer of module paths inside the profiles tree, and the multi-step
   version-guard interplay across a real fold are only exercised live.
4. **The stream events** - the normalize flavors fire on REAL tool-stream
   writes (`write`/`edit`/`raw-write`/`normalize-file` through the harness's
   governed write path), not on synthetic stream captures.
5. **The storage domain** - open failures in the silent-catch era; real
   ledger files under `~/.dsh/*.log` with append semantics.
6. **The observability surface** - `cordis_inspect_list/query`,
   `plugin_manager` list/enable/disable against the loaded bundles.
7. **The introspection contract** - Config schemas, Tool schemas, Event
   modes registered by the family's plugins as the harness projects them.

---

## 2. The mechanism - exercise the family THROUGH the harness's own event loop

### 2.1 Isolation strategy (the real profiles untouched)

Two equivalent isolation levels; **B is the default** (fully isolated, CI-safe):

- **A. Scratch profile inside the real `~/.dsh`:** create
  `~/.dsh/profiles/dsh-test/`. The harness enumerates `$HOME/.dsh/profiles/*`;
  a new profile directory is inert until a session is launched against it -
  the running `desktop`/`web` sessions are never pointed at it. Destroy = one
  `rm -rf`.
- **B. Redirected home (`DSH_HOME`):** the harness boot reads `DSH_HOME`
  (verified in `dsh/lib/profile-boot-*.js`: the home patch layer is
  `$DSH_HOME/cordis.patch.yml`, "`$DSH_HOME` may be set by the test or
  launcher after import"). Set `DSH_HOME=$SCRATCH` and the entire home -
  profiles, ledgers, skills - lives in a throwaway directory. Zero writes
  anywhere under the real `~/.dsh`.

### 2.2 The no-symlink constraint - install mechanics

The LIVE `desktop` profile installs every family package with
`link:~/.dsh/profiles/desktop/bundles/<name>` - symlinks. The scratch profile
must NOT: `link:` and workspace deps create symlinks; the goal is **copied
artifacts** so the test exercises exactly what `npm install <tarball>`
consumes after publishing.

**Method 1 - `pnpm pack` tarballs (canonical, publish-identical):**

```bash
# from the monorepo root: pack each release package (Classic/ = the release names)
mkdir -p "$SCRATCH/tarballs"
for p in plugin-dsh-factory hook-dsh-core hook-dsh-package-governor \
         hook-dsh-package-pinner hook-dsh-cargo-governor \
         hook-dsh-normalize-dash hook-dsh-normalize-quotes \
         hook-dsh-normalize-ellipsis hook-dsh-normalize-spaces \
         hook-dsh-normalize-invisible hook-dsh-normalize-fullwidth \
         hook-dsh-normalize-file; do
	(cd "Classic/packages/$p" && pnpm pack --pack-destination "$SCRATCH/tarballs")
done
```

**Method 2 - `file:` protocol (npm/pnpm COPIES `file:` deps; no symlinks):**

```bash
# in $SCRATCH/profiles/dsh-test/package.json, dependencies section:
#   "@playform/plugin-dsh-factory": "file:../../../tarballs/playform-plugin-dsh-factory-0.0.1.tgz"
# verify NO symlinks after install:
find "$SCRATCH" -type l | grep -v node_modules/.pnpm || echo "no symlinks"
```

Post-install invariant (assert in the test): every
`$SCRATCH/**/node_modules/@playform/*` entry is a real directory -
`find -type l` returns nothing outside pnpm's internal store layout, and the
installed `Target/Library.js` bytes match the monorepo build (checksum
compare vs `Classic/packages/<name>/Target/Library.js`).

### 2.3 The scratch profile skeleton

```text
$SCRATCH/                          # DSH_HOME (method B) or ~/.dsh (method A)
├── profiles/
│   └── dsh-test/
│       ├── package.json           # dsh.profile.bundles = the 12 @playform names
│       ├── cordis.yml             # [] (the empty root - same as desktop)
│       ├── cordis.patch.yml       # copied/adapted from desktop MINUS personal config
│       └── pnpm-lock.yaml         # produced by install
├── cordis.patch.yml               # $DSH_HOME home-level patch layer (optional)
└── ledgers appear here at runtime # governor.log, pinner.log, cargo-governor.log,
                                   # normalize-*.log, mdash.log
```

`package.json` (the bundle list mirrors the live desktop profile, names per
the #15 release naming):

```json
{
	"name": "dsh-profile-dsh-test",
	"private": true,
	"dsh": {
		"profile": {
			"bundles": [
				"@deepseek-ai/dsh-base",
				"@deepseek-ai/dsh-web-app",
				"@playform/plugin-dsh-factory",
				"@playform/hook-dsh-package-governor",
				"@playform/hook-dsh-package-pinner",
				"@playform/hook-dsh-cargo-governor",
				"@playform/hook-dsh-normalize-dash",
				"@playform/hook-dsh-normalize-quotes",
				"@playform/hook-dsh-normalize-ellipsis",
				"@playform/hook-dsh-normalize-spaces",
				"@playform/hook-dsh-normalize-invisible",
				"@playform/hook-dsh-normalize-fullwidth",
				"@playform/hook-dsh-normalize-file"
			]
		}
	}
}
```

### 2.4 The real flows (create → install → activate → exercise → verify → destroy)

1. **Create** - scaffold the skeleton above; `DSH_HOME` export (method B).
2. **Install** - `pnpm install` in the profile dir with the tarball `file:`
   deps; assert the no-symlink invariant (§2.2).
3. **Activate** - launch the harness against the scratch home; the profile's
   bundles load through the REAL loader. Verify via the runtime introspection
   surface INSIDE the scratch session:
   `cordis_inspect_list` → the nine Inspect Providers resolve;
   `cordis_inspect_query` (host `Config.listConfigs`) → every family plugin's
   Config entry appears; `plugin_manager` list → the 12 bundles listed.
4. **Exercise the real flows** - perform writes through the governed write
   path of the scratch session:
   - **normalize flavors**: `write`/`raw-write` a file containing mdashes,
     curly quotes, ellipses, unicode spaces, invisibles, fullwidth chars →
     the stream events normalize them → the ledger logs the activation line
     and the `normalized N ... char(s) in one stream` line.
   - **normalize-file**: `normalize-file` a pre-existing non-conforming file →
     the six-transform family runs → the per-file ledger lines.
   - **governor/pinner/cargo**: `write`/`edit` real files (governed) →
     `governor.log` chain-pass lines, `pinner.log` version-guard lines,
     `cargo-governor.log` cargo-flavor lines; attempt a governed-path
     violation to capture a REFUSAL line (the negative case, safely, in the
     scratch tree only).
5. **Verify** - the ledger assertions (below) + byte-compare the written
   files against the expected normalized output (the same fixtures the smokes
   use, promoted to on-disk fixtures).
6. **Destroy** - `rm -rf $SCRATCH` (method A: `rm -rf ~/.dsh/profiles/dsh-test`
   plus the tarballs dir). No residue; the real ledgers never gain a line.

### 2.5 The verification assertions (the live ledger contract)

The live battery asserts the SAME byte-identical ledger strings the smokes
assert, now read from the scratch home's real log files:

- `activated (replacement=-, reasoning=on, toolArgs=off, logFile=...)` per flavor.
- `normalized N dash char(s) in one stream` (and the flavor equivalents).
- The governor chain-pass / refusal lines; the pinner guard lines; the cargo
  flavor lines.
- Ordering: the pinner's activation precedes the governor's (the live load
  order - the gap §1.2-1, now asserted instead of anecdotal).

### 2.6 The CONFIGURED persistent profile + the dsh headless mode (implemented)

The throwaway scratch (§2.4) is the isolation variant. The persistent variant
is the same scaffold, created ONCE and left in place:

- **Location:** `~/.dsh-dogfood` (a dedicated `DSH_HOME` — the user's real
  `~/.dsh` is never written), with **one subhome per tree**: `classic/` and
  `ets/`. The profile name is `dsh-test` in both, but the two scaffolds
  install different package groups (the Classic `@playform/hook-dsh-*` /
  `@playform/plugin-dsh-factory` names vs the EffectTS
  `@playform/ets-hook-dsh-*` / `@playform/ets-plugin-dsh-factory` group), so
  a single home cannot serve both trees — the subhome split is the plan's
  variant of §2.1's isolation levels. Each profile is produced by the
  wiring-live scaffold (`wiring-live.mjs` → `EnsureScratch`), which is the
  configurator of record: the 12 `file:` tarball deps (no symlinks beyond
  pnpm's own `.bin` shims), the empty `cordis.yml` root, the minimal user
  layer, `overlay.yml` / `overlay-nf.yml`, the scratch-only exercise driver
  (`@local/dsh-wiring-exercise`), the fake cargo shim, and the exercise
  workspaces with their registries. The `.wiring-ready.json` marker makes
  subsequent runs reuse a subhome as-is.
- **CLI verification (read-only):**
  `DSH_HOME=~/.dsh-dogfood dsh --profile dsh-test --dump-config` — the
  composed tree shows the base stack plus all family plugins
  (`plugin-dsh-factory`, the governor/pinner/cargo hooks, the six flavors
  and normalize-file); `--dump-config-schema` prints the profile entry/patch
  schema.
- **Headless one-task mode:** `dsh headless "<task>"` with the dedicated home
  exported selects the profile implicitly (it is the only profile there):
  `DSH_HOME=~/.dsh-dogfood dsh headless "run the tests"`. It answers one
  task, prints the result to stdout (diagnostics to stderr), and exits;
  `--json` emits newline-delimited run events, `--session-id` resumes. A
  model round-trip needs a provider credential in the launching environment
  (see the residual in §7); the profile boots and reaches the LLM layer
  without one. The REAL flows (normalize / governor / pinner / cargo) need
  no model at all — they are driven by the exercise driver inside the booted
  profile, which is how the wiring suites exercise them today; a credentialed
  headless task is the variant that triggers the same flows through an
  agent's tool calls and asserts the ledgers afterwards.
- **Battery integration:** `Maintain/Run-Wiring.mjs` honours
  `DSH_WIRING_HOME=<base home>` — the fast path (each tree reuses its
  configured subhome, no repack/reinstall, nothing destroyed). Without it,
  the temp scratch lifecycle (create → … → destroy) runs as before, one
  throwaway home per tree. Both paths run the same 7 suites × 2 trees.

```bash
# the fast path (the configured profile):
DSH_WIRING_HOME="$HOME/.dsh-dogfood" pnpm test:wiring
# the isolation path (throwaway scratch, destroyed at exit):
pnpm test:wiring
# the headless one-task flow against the dedicated profile:
DSH_HOME="$HOME/.dsh-dogfood" dsh headless "run the tests"
```

---

## 3. The test-case suite structure to ADD

Convention compliance: additive coverage (never weaken existing assertions),
the ledger strings stay byte-identical, the suites live with the family's
smokes and print `N checks - ALL PASS`. The new suites are the **wiring**
suites - a third axis beside Classic/EffectTS mechanics:

| # | New suite (per tree, under `Classic/smokes/`, `EffectTS/smokes/`) | Checks | Covers |
|---|---|---|---|
| 1 | `scratch-profile-smoke.mjs` | ~20 | §2.3 skeleton validity: the bundle list, the empty `cordis.yml`, the patch-file shape, the no-symlink post-install invariant, the tarball/file: install produces real dirs |
| 2 | `profile-assembly-smoke.mjs` | ~15 | `dsh.profile.bundles` → the resolved load order; the pinner-before-governor ordering asserted against the harness's real resolution |
| 3 | `patch-layer-smoke.mjs` | ~12 | the effective-config rule: the patch config replaces the entry config wholesale; `$DSH_HOME/cordis.patch.yml` layering; a patch toggle flips a family plugin's Config as seen by `Config.listConfigs` |
| 4 | `live-ledger-smoke.mjs` | ~18 | the scratch run's ledger files exist, the activation lines match the smoke-contract strings byte-for-byte, the flavor counts increment per exercised write |
| 5 | `governed-write-smoke.mjs` | ~15 | a real `write`/`edit`/`raw-write`/`normalize-file` through the harness's event loop normalizes the fixture and leaves the expected bytes on disk |
| 6 | `refusal-path-smoke.mjs` | ~8 | the governed-path violation inside the scratch tree produces the refusal ledger line and leaves the file untouched |
| 7 | `introspection-smoke.mjs` | ~10 | `cordis_inspect_list`/`query` project the family's Services/Events/Configs/Tools with the exact registered names |

**Runner:** extend `pnpm test` to `30 smokes` (24 mechanics + 6 wiring) with
the wiring suites SKIPPED cleanly (exit 0, `SKIPPED (no scratch home)`) when
`DSH_TEST_SCRATCH` is unset - CI runs them in the dedicated job (§4).

**Harness-observability angle:** each wiring suite is also a probe of the
nine Inspect Providers - the suites document, by asserting, what a
scratch-profile session CAN see (the skill's observable surface becomes a
tested contract, not prose).

**Every live finding becomes a mechanics regression** (the fidelity-gap
rule): a wiring suite failure first spawns a new fake-ctx check in the
corresponding mechanics suite before the wiring suite is re-run.

---

## 4. CI-ability - the scratch profile lifecycle as a job

```yaml
# the wiring job (conceptual):
- checkout
- build the 12 Classic packages (tsc + minify)
- pnpm pack → tarballs/
- export DSH_HOME=$RUNNER_TEMP/dsh-home          # fully isolated
- scaffold profiles/dsh-test + pnpm install      # file: tarball deps
- assert no-symlink invariant
- launch the harness headless against $DSH_HOME, run the governed-write script
- run the 7 wiring suites against the scratch home
- rm -rf $RUNNER_TEMP/dsh-home                   # destroy
- always: the 24 mechanics suites (unchanged, no harness needed)
```

Runtime cost: one profile install (~seconds, tarball deps, no registry) +
one harness boot. Secrets: none needed if the LLM provider config is omitted
from the scratch patch - the governed write path does not require a model
round-trip; where a session LLM is needed, the cheapest provider route from
the live patch is copied with a test key from CI secrets.

---

## 5. The exact no-symlink install commands (summary card)

```bash
SCRATCH="$HOME/.dsh/profiles/dsh-test"        # method A; method B: SCRATCH="$TMP/dsh-home"
mkdir -p "$SCRATCH" "$SCRATCH/tarballs"

# pack from the monorepo (release tree = Classic/)
for p in plugin-dsh-factory hook-dsh-core hook-dsh-package-governor \
	hook-dsh-package-pinner hook-dsh-cargo-governor hook-dsh-normalize-dash \
	hook-dsh-normalize-quotes hook-dsh-normalize-ellipsis hook-dsh-normalize-spaces \
	hook-dsh-normalize-invisible hook-dsh-normalize-fullwidth hook-dsh-normalize-file; do
	(cd "Classic/packages/$p" && pnpm pack --pack-destination "$SCRATCH/tarballs")
done

# dependencies (file: copies - never link:, never workspace:)
# "@playform/plugin-dsh-factory": "file:./tarballs/playform-plugin-dsh-factory-0.0.1.tgz"
(cd "$SCRATCH" && pnpm install)

# the invariant:
test -z "$(find "$SCRATCH" -type l)" && echo "NO SYMLINKS - OK"
```

---

## 7. Residuals (as implemented)

- **Verification record:** the full wiring battery is green through the
  configured profile — `DSH_WIRING_HOME=~/.dsh-dogfood pnpm test:wiring` →
  all 14 suites (7 per tree, 202 wiring checks) ALL PASS, repeatable over the
  persistent subhomes (the runner resets each subhome's ledgers and the
  exercise work areas to their seeds per run, so reruns are deterministic).
  Both profiles dump-compose (`dsh --profile dsh-test --dump-config`) with
  all family entries present; headless boots the profile and reaches the LLM
  layer (`MISSING_CREDENTIAL` without a key).
- **The EffectTS scaffold was renamed mid-batch and had never run green:** it
  packed from `Classic/packages` with pre-#15 directory candidates and
  patched entry ids `hook-dsh-*` that the ets bundles don't register (their
  ids are `ets-hook-dsh-*`), and the ets packages' dependency on the base
  `@playform/ets-base-dsh` was neither packed nor overridden (a registry 404
  at install). Fixed: the scaffold packs from `EffectTS/packages` (13
  tarballs incl. the base), overrides all three internal names, targets the
  `ets-` entry ids, and the suites assert the ets names.
- **The journal-open race is ledger-owner-dependent:** which module's ledger
  records `storage journal open failed: domain 'package_governance' is
  already open` depends on which best-effort open loses the race (governor in
  the Classic boots, pinner/cargo in the ets boots); the live-ledger suites
  scan the family ledgers. Likewise the pinner/governor activation stamps
  race at millisecond resolution — the profile-assembly suites compare within
  a 50 ms race window (a gross inversion still fails).
- **No API credential in the dedicated home's launching environment:** the
  headless one-task flow was verified to boot `dsh-test` and fail fast with
  the harness's own `MISSING_CREDENTIAL` diagnostic; a full model round-trip
  needs `DEEPSEEK_API_KEY` (or the cloudflare route config + key) exported
  at launch. The flows under test need no model — the exercise driver path
  is credential-free and fully verified.
- **pnpm `.bin` shims:** the only symlinks in the dedicated home are pnpm's
  own `node_modules/.bin` entries (npm-check-updates/ncu); every package
  directory is a real copied file: install — the no-symlink invariant holds.
- **The persistent subhomes are not auto-refreshed:** after package changes,
  delete `~/.dsh-dogfood/classic` / `~/.dsh-dogfood/ets` (or just its
  `.wiring-ready.json`) and let the scaffold recreate them; the temp scratch
  path always packs fresh.

---

## 6. Disciplines

- The implementation followed the user's explicit activation (the profiles,
  the battery integration, the verification); nothing else was touched.
- NEVER commit; the user commits.
- The real `~/.dsh` profiles are read-only-inspected; every mutation targets
  the scratch home; destroy leaves no residue.
- The ledger strings are the contract everywhere: byte-identical, never
  reworded, in smokes and in live assertions alike.
- Totals stay truthful: 733 Classic / 746 EffectTS mechanics checks; the
  wiring checks are reported separately, never folded into those numbers.
