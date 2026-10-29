# CHANGELOG - @playform/ets-plugin-dsh-lesson-review

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together, with the host line at `0.2.1-rc.4` and zod at 4.6.7.

- The activation version constant moves to 0.3.0.

## 0.2.0

This release holds the first cut of the post-turn self-improvement review, in the 0.2.0 wave of the
family.

- The `lesson` service offers `Tick`/`Reset` for the nudge counter, `Digest`, `Prompt`, `Parse`,
  `Judge`, `Snapshot`, `Review`, `Curate`, `Status`, `Pin`/`Unpin`, `Restore`/`Archive`,
  `Pending`/`Accept`, and `Save`/`Flush`.
- The review pipeline runs one bounded digest, one hand-built `ctx.llm.stream` request, a strict
  reply parse, deterministic acceptance rules, the guarded write, and a per-run report.
- The shipped posture is PROPOSE (`policy.write: approve`), agreement operations are always queued,
  and the exact-file fence holds under `write: auto`.
- The lifecycle is deterministic and carries the four protections: pin, policy flag, zero-use grace,
  and archive-as-rename.
- The release adds the D6 policy block, the fail-loud knob checks, and the idle-forever default.
- `Source/Test` holds 6 folders and 65 checks across `Nudge-Cadence`, `Digest-And-Prompt`,
  `Parse-And-Judge`, `Apply-And-Pending`, `Curate-Lifecycle`, and `Policy-Defaults`.
- Known seams in SCHEME §6 are the live-session surface read, which is probed and not verified, the
  absent review slot in `GenerateOptions.purpose`, and the KV storage domain and the LLM
  consolidation pass, which are declared but unwired.
