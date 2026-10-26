# CHANGELOG - @playform/plugin-dsh-lesson-review

## 0.2.0

The first cut of the post-turn self-improvement review, in the family's 0.2.0 wave.

- The `lesson` service: `Tick`/`Reset` (the nudge counter), `Digest`, `Prompt`, `Parse`, `Judge`,
  `Snapshot`, `Review`, `Curate`, `Status`, `Pin`/`Unpin`, `Restore`/`Archive`, `Pending`/`Accept`,
  `Save`/`Flush`.
- The review pipeline: one bounded digest, one hand-built `ctx.llm.stream` request, a strict reply
  parse, deterministic acceptance rules, the guarded write, and a per-run report.
- The shipped posture is PROPOSE (`policy.write: approve`); agreement operations are always queued;
  the exact-file fence holds under `write: auto`.
- The deterministic lifecycle with the four protections (pin, policy flag, zero-use grace,
  archive-as-rename).
- The D6 policy block, the fail-loud knob checks, and the idle-forever default.
- `Source/Test`: 6 folders, 65 checks (`Nudge-Cadence`, `Digest-And-Prompt`, `Parse-And-Judge`,
  `Apply-And-Pending`, `Curate-Lifecycle`, `Policy-Defaults`).
- Known seams (SCHEME §6): the live-session surface read is probed, not verified;
  `GenerateOptions.purpose` has no review slot; the KV storage domain and the LLM consolidation pass
  are declared but unwired.
