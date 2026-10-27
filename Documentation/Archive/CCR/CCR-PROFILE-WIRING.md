---
title: The CCR desktop-profile activation materials
category: Archive/CCR
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/CCR/CCR-PROFILE-WIRING.md
index: Documentation/INDEX.md
statuses:
    - name: the profile wiring materials (the patch row, the config)
      state: implemented
      evidence: the ccr enabled in the profile; the row validated
    - name: the live activation proof
      state: implemented
      evidence: the ledger's stored line; the marker produced live; the retrieval round-trip worked
    - name: the volatile knob flip (autoExpandLimitBytes)
      state: implemented
      evidence: the control panel flip took effect without a remount
---

# CCR PROFILE WIRING - the desktop-profile activation materials (2026-10-19)

> Phase 5 MATERIALS for `@playform/dsh-hook-ccr` (plan:
> `Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md` §7 phase 5). **STATUS: MATERIALS ONLY -
> nothing here has been applied to any profile.** `~/.dsh` was NOT touched by the authoring session.
> (The monorepo law: monorepo development NEVER modifies the `~/.dsh` originals.) The USER applies
> these steps by hand, then restarts the app and runs the verification checklist at the end (or
> `live-verify.mjs`).

## 0. Prerequisites

1. The bundle is built: `Boilerplate/packages/dsh-hook-ccr` has a populated `Target/` from the
   deterministic three-step build (`pnpm install --ignore-scripts && pnpm run prepublishOnly`).
2. Phases 1-4 are green: `node Boilerplate/smokes/ccr-smoke.mjs` (146 PASS, 0 FAIL as of this
   document) and the full suite (`pnpm run test`, `Maintain/Run-Smokes.mjs`) pass.
3. The plugin is feature-off by default, with `contextEngine: false` in the config below, and the
   context engine (SCHEME.md §9) stays inert until the user flips it deliberately.

## 1. The bundle installation (the family's `link:` convention)

The LIVE desktop profile resolves EVERY family bundle from `~/.dsh/profiles/desktop/bundles/<name>`
(EACH a full package copy: `Target/`, `cordis.patch.yml`, `package.json`, ...), lists it in
`dsh.profile.bundles`, and holds a `link:` dependency for it in the profile `package.json` (verified
read-only against the twelve installed bundles, 2026-10-19). The `link:` entries are also how the
built `Target/` of a bundle resolves sibling imports, and the CCR `Target/Function/Apply.js` imports
`@playform/dsh-hook-core` (the activation-proof composer), which resolves through the
`node_modules/@playform/dsh-hook-core` link at the profile root.

### 1a. Copy the built bundle

```sh
# from the monorepo root
cp -R Boilerplate/packages/dsh-hook-ccr ~/.dsh/profiles/desktop/bundles/dsh-hook-ccr
```

Notes:

- The copy carries the OWN `cordis.patch.yml` of the bundle (§2), and like EVERY installed family
  bundle its patch layer composes at host boot, so NO entry is needed in the profile
  `~/.dsh/profiles/desktop/cordis.patch.yml`.
- Keep the sibling resolution intact. The
  `node_modules/@playform/{dsh-plugin-factory,dsh-hook-core}` symlinks of the bundle point into the
  monorepo workspace and exist for development/smoke use; in the installed copy they are unnecessary
  (profile-root resolution) but harmless. If `pnpm install` dropped them in the monorepo package,
  recreate them with `ln -sfn ../../../dsh-plugin-factory node_modules/@playform/dsh-plugin-factory`
  (and `dsh-hook-core` likewise) from `Boilerplate/packages/dsh-hook-ccr`.

### 1b. The profile `package.json` additions (EXACT strings)

In `~/.dsh/profiles/desktop/package.json`:

1. Add to `dsh.profile.bundles` (order within the list does not matter). The PENDING state of the
   loader orders by `inject`, and `ccr` injects ONLY `pluginFactory` + `tools`:

    ```json
    "@playform/dsh-hook-ccr"
    ```

    The list then ends:

    ```json
    "bundles": [
      "@deepseek-ai/dsh-base",
      "@deepseek-ai/dsh-web-app",
      "@playform/dsh-plugin-factory",
      "@playform/dsh-hook-package-governor",
      "@playform/dsh-hook-package-pinner",
      "@playform/dsh-hook-cargo-governor",
      "@playform/dsh-hook-normalize-dash",
      "@playform/dsh-hook-normalize-quotes",
      "@playform/dsh-hook-normalize-ellipsis",
      "@playform/dsh-hook-normalize-spaces",
      "@playform/dsh-hook-normalize-invisible",
      "@playform/dsh-hook-normalize-fullwidth",
      "@playform/dsh-hook-normalize-file",
      "@playform/dsh-hook-ccr"
    ]
    ```

2. Add to `dependencies` (the family convention is `link:` into the bundles directory, and a `file:`
   dependency alone is NOT activation):

    ```json
    "@playform/dsh-hook-ccr": "link:~/.dsh/profiles/desktop/bundles/dsh-hook-ccr"
    ```

## 2. The patch entry (`cordis.patch.yml`, `insert:`)

The bundle SHIPS its patch (`Boilerplate/packages/dsh-hook-ccr/cordis.patch.yml`, installed as
`~/.dsh/profiles/desktop/bundles/dsh-hook-ccr/cordis.patch.yml` by step 1a). The `insert:` declares
the new loader entry `ccr` with the §5 config of the plan verbatim. EXACT block (YAML, spaces,
4-space indent under `insert:`, list items at 12-16 columns matching the shipped file):

```yaml
- insert:
      - id: ccr
        name: "@playform/dsh-hook-ccr"
        config:
            log: true
            logFile: ~/.dsh/playform/hook-dsh-ccr.log
            targets:
                - bash
                - glob
                - grep
                - read
                - web_fetch
                - web_search
                - list
                - search
            exempt:
                - write
                - edit
                - raw-write
                - subagent
                - ask_user_question
                - ccr_retrieve
            thresholdBytes: 2048
            inlineThresholdBytes: 1024
            autoExpand: true
            autoExpandLimitBytes: 102400
            compressFailures: false
            multipliers:
                terminal: 1
                error: 8
                grep: 2
                paths: 2
                file: 1
                json: 1
                web: 2
                default: 1
            previewMaxChars: 240
            ttlSeconds: 3600
            storeBudgetBytes: 268435456
            journalPath: ""
            contextEngine: false
            contextEngineThresholdPct: 30
            protectFirstTurns: 2
            protectLastTurns: 4
```

Notes:

- The row is `insert:` and NOT a bare `id:` row, because the entry is NEW. A bare `id: ccr` row
  would PATCH an existing entry, and the loader rejects unknown ids with `entry "..." not found`.
- The loader validates the config against the Schemastery schema of the plugin and fills the
  defaults, and an unknown or malformed field fails LOUD at load.
- If the patch file of the bundle copy is ever removed, the same block can be appended to
  `~/.dsh/profiles/desktop/cordis.patch.yml`, because the patch layer of the profile is applied
  after EVERY bundle layer. The preferred form of the family, however, is the bundle-carried patch,
  and the twelve installed bundles ALL carry their own.
- `journalPath: ""` means memory-only. To persist the store across restarts, set it to a JSONL file
  path (e.g. `~/.dsh/ccr-store.jsonl`), which is loaded and TTL-compacted at EVERY boot.
- `contextEngine: false` (default) keeps the phase-4 engine inert, and flipping it to `true` adds
  the `agent/pre-step` archive listener (SCHEME.md §9), an honest MVP that stores and tracks but
  does NOT rewrite the history of the model, with the new ledger line
  `ccr: engine archived <n> results`.

## 3. The restart requirement

Bundle layers compose at host boot, so after steps 1-2 the app MUST be restarted (quit and relaunch
the DeepSeek Harness). Nothing activates on a hot config edit, because `dsh.profile.bundles` and
`dependencies` are structural (profile-level). The own structural knobs of the plugin remount ONLY
on a plugin-level edit AFTER activation. Verify the activation with §4 step 1 before ANY further
testing.

## 4. The verification checklist (after the restart)

1. **The activation ledger line** - `~/.dsh/playform/hook-dsh-ccr.log` contains:

    ```
    ccr: activated (bundle 0.1.0, targets 8, budget 268435456)
    ```

    The durable form is `[<ISO timestamp>] activated (bundle 0.1.0, targets 8, budget 268435456)`,
    because the file lines carry no module prefix. If the numbers differ, the effective config
    differs from §2, so re-check the patch layer.

2. **One LIVE >2048-byte bash result renders preview + marker** - run a command whose serialized
   output exceeds 2048 bytes, e.g. `bash: ls -la /usr/lib | head -200` (or ANY verbose command), and
   confirm that the transcript shows ONE text block shaped exactly like:

    ```
    [terminal:exit 0 | <N> lines | <first significant line>]
    <<<CCR:<24 lowercase hex>|terminal|<byte size>>>
    ```

    and that the ledger gains `ccr: compressed bash terminal <bytes> -> <hash>`.

3. **The `ccr_retrieve` round-trip** - in the same session, call `ccr_retrieve` with the 24-hex hash
   of the marker and confirm that the ORIGINAL command output comes back verbatim (optionally with
   `range { start, count }` for a granular slice), and the ledger gains `ccr: retrieved <hash>`.

4. **Exempt tools untouched** - run a `write`/`edit`/`raw-write` (and a `subagent` brief, if
   convenient) and confirm that the results pass through byte-identical (NO `[type:` preview line,
   NO `<<<CCR:` marker, NO new compressed/stored ledger lines). Under-threshold results of target
   tools likewise pass through unchanged.

5. **Auto-expand sanity** (default on) - a target-tool result between 2048 and 102400 bytes is
   STORED but returned FULL (NO marker in the transcript), the ledger gains
   `ccr: stored <tool> <type> <bytes> -> <hash>`, and the entry is retrievable by its hash.

6. **The engine stays inert** (default) - NO `ccr: engine ` lines appear in the ledger while
   `contextEngine: false`.

Or run the bundled checker, which performs 1 automatically against the LIVE ledger and 2-5
synthetically against the REAL built Target (a fake ctx, the same harness pattern as the smoke, and
it NEVER touches the LIVE loop):

```sh
node ~/.dsh/profiles/desktop/bundles/dsh-hook-ccr/live-verify.mjs
# or, from the monorepo:
node Boilerplate/packages/dsh-hook-ccr/live-verify.mjs
```

## 5. Rollback

Remove `"@playform/dsh-hook-ccr"` from `dsh.profile.bundles` and from `dependencies`, delete
`~/.dsh/profiles/desktop/bundles/dsh-hook-ccr`, and restart. The ledger
(`~/.dsh/playform/hook-dsh-ccr.log`) is a plain diagnostic file that is safe to keep or delete, and
NO governed state exists outside it and the (optional) JSONL journal.
