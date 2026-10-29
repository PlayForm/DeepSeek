# CHANGELOG - @playform/ets-hook-dsh-lesson-nudge

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together - the host line to `0.2.1-rc.4` and zod to 4.6.7.
- The activation version constant moves to 0.3.0.

## 0.2.0

This release is the first cut of the post-turn nudge, in the 0.2.0 wave of the family.

- An `agent/status` listener on the `idle` edge, where the review runs inside `agent.runMaintenance`
  and never beside the live turn.
- The four gates: the switch, the edge, the service probe (`lesson`, warned once when absent), and
  the cadence plus the per-session `maxReviewsPerSession` cap.
- Fail-open throughout, because a throwing service or a rejected maintenance task warns and passes
  the transition unnudged.
- The State builder and ledger of the factory, the D6 policy block, and the idle-forever default
  (`enabled: false`).
- `Source/Test/Listen-And-Nudge` holds 10 checks over every gate and the one review path.
