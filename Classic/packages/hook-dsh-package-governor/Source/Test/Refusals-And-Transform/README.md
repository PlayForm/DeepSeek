# Refusals-And-Transform

What this test verifies.

## Intent

The refusal and no-op surface of the chain pass, plus the contract of the module transform and the
P4 fence: an undecodable manifest produces exactly the g2 line plus the `observed non-JSON ... -
skipped` line (no write, no update stage); a missing registry skips the pass and keeps the passage
closed (no update stage, the no-flap rule); an unreadable registry produces the byte-identical
`unreadable registry.json ... skipped for <path>` line and closes the passage the same way; strict
mode strips unknown deps while it canonicalizes the chain pin; the transform, probed directly,
decodes inside and ignores the keep-list; its post-write message composes the version-bearing line,
marks the passage, and journals the governed record; an idempotent manifest maps to null and keeps
the passage closed when a registry exists (every computed pin equals its current pin, so the update
stage is not dispatched and nothing is written) and the no-registry no-change path keeps the passage
closed too; and a backend configured for sandbox mode receives a workspace-write fence rooted at the
own directory of the governed manifest. The assertions are moved verbatim from sections 6-6b of
`Classic/smokes/governor-smoke.mjs` (the transform contract and the P4 posture included).

## Scenario

- Group: chain-pass no-ops and refusals.
    - Sub: "transform: undecodable manifest -> `observed non-JSON ... -
      skipped`, no write, no update"
    - Sub: "chain semantics: no registry.json -> pass skipped, everything
      public, no update stage"
    - Sub: "chain semantics: unreadable registry -> `unreadable registry.json
      ... skipped for <path>`"
    - Sub: "chain semantics: strict strip of unknown deps (never a default) +
      canonicalization"
- Group: the transform contract, probed directly.
    - Sub: "transform: raw text in, decode inside; keep-list ignored (governor
      closes over its sections)"
    - Sub: "transform: the message composes `governed <path> -> <version>`
      from the outcome"
    - Sub: "transform: the post-write message marks the passage + journals the
      governed record"
    - Sub: "transform: idempotent manifest -> null; the no-change path keeps
      the passage closed"
    - Sub: "transform: no registry -> the no-change path keeps the passage
      closed (the no-flap rule)"
- Group: the P4 confined fence posture.
    - Sub: "P4: confined backend -> workspace-write fence rooted at the
      manifest's own directory"

## Fixtures

The harness world (Boot) with `Probe.Mode = "bin"`.

SILENT REPLAY: the source suite is cumulative - the undecodable-manifest check asserts the ABSOLUTE
count of started jobs, which was 1 because the proj-a chain pass of section 5 had already run. This
folder replays that generating fixture (proj-a with its registry and manifest, one listener fire,
unasserted) before the checks, so the absolute count holds; the replay is verified indirectly by
that count assertion itself.

Per-check fixtures: proj-h (non-JSON manifest), proj-b (no registry), proj-d (unreadable
registry.json), proj-e (strict strip, Probe.Strict toggled), the direct transform probe
(`BuildTransform(Probe, { targetKey: "k-t", ... })` with the shared `passage` object), the no-change
probe (`k-t-noop` with its own `noopPassage` object), the no-registry probe (`k-t-public` with its
own `publicPassage` object), and proj-fence with `Context.fs.sandboxMode = "workspace-write"`
toggled around the fire.

## Expected ledger strings (byte-identical)

- `no registry.json found for <path> - chain pass skipped` (U+2014)
- `observed non-JSON package.json <path> - skipped` (U+2014)
- `update stage dispatched for <dir> (mode=bin, ncu via ncu, built-in default
  policy)`
- `unreadable registry.json at <path> - chain pass skipped for <path>`
  (U+2014)
- `governed <path> -> fresh-...` (U+2192)
- `governed <path> -> fresh-9` (the transform's composed message, U+2192)

## Edge cases

- The non-JSON window adds exactly 2 lines (g2 + non-JSON) and no update stage - the
  passage-closed negative control.
- The keep-list passed to the transform does NOT pin (the governor closes over its own sections).
- A registry-present no-change manifest keeps the passage closed: no update stage dispatch and no
  write (the no-flap rule).
- The unreadable registry keeps the passage closed like the missing registry (the no-flap rule) and
  seeds the Stash at the observed version (no U-sub-2 advance - no update stage runs).
- The confined fence is rooted at the directory of the manifest, not the workspace.

## Expected count

10 PASS.
