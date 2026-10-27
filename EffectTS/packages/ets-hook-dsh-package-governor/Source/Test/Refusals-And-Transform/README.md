# Refusals-And-Transform

What this test verifies.

## Intent

This folder covers the refusal and no-op surface of the chain pass, plus the module transform contract and the P4 fence.

An undecodable manifest produces exactly the g2 line plus the `observed non-JSON ... - skipped` line, with no write and no update stage.

A missing registry skips the pass and keeps the passage closed (no update stage, the no-flap rule).

An unreadable registry produces the byte-identical `unreadable registry.json ... skipped for <path>` line and closes the passage the same way.

Strict mode strips unknown deps while it canonicalizes the chain pin.

The transform, probed directly, decodes inside and ignores the keep-list.

Its post-write message composes the version-bearing line, marks the passage, and journals the governed record.

An idempotent manifest maps to null and keeps the passage closed when a registry exists (every computed pin equals its current pin, so the update stage is not dispatched and nothing is written), and the no-registry no-change path keeps the passage closed too.

A sandbox-mode-configured backend receives a workspace-write fence rooted at the own directory of the governed manifest.

The assertions are moved verbatim from `Classic/smokes/governor-smoke.mjs` sections 6-6b (the transform contract and the P4 posture included).

## Scenario

- Group: chain-pass no-ops and refusals.
    - Check: "transform: undecodable manifest -> `observed non-JSON ... - skipped`, no write, no update".
    - Check: "chain semantics: no registry.json -> pass skipped, everything public, no update stage".
    - Check: "chain semantics: unreadable registry -> `unreadable registry.json ... skipped for <path>`".
    - Check: "chain semantics: strict strip of unknown deps (never a default) + canonicalization".
- Group: the transform contract, probed directly.
    - Check: "transform: raw text in, decode inside; keep-list ignored (governor closes over its sections)".
    - Check: "transform: the message composes `governed <path> -> <version>` from the outcome".
    - Check: "transform: the post-write message marks the passage + journals the governed record".
    - Check: "transform: idempotent manifest -> null; the no-change path keeps the passage closed".
    - Check: "transform: no registry -> the no-change path keeps the passage closed (the no-flap rule)".
- Group: the P4 confined fence posture.
    - Check: "P4: confined backend -> workspace-write fence rooted at the manifest's own directory".

## Fixtures

The harness world (Boot) runs with `Probe.Mode = "bin"`.

SILENT REPLAY: the source suite is cumulative, and the undecodable-manifest check asserts the ABSOLUTE count of started jobs, which was 1 because the proj-a chain pass of section 5 had already run.

This folder replays that generating fixture (proj-a with its registry and manifest, one listener fire, unasserted) before the checks, so the absolute count holds, and the replay is verified indirectly by that count assertion itself.

Per-check fixtures: proj-h (non-JSON manifest), proj-b (no registry), proj-d (unreadable registry.json), proj-e (strict strip, Probe.Strict toggled), the direct transform probe (`BuildTransform(Probe, { targetKey: "k-t", ... })` with the shared `passage` object), the no-change probe (`k-t-noop` with its own `noopPassage` object), the no-registry probe (`k-t-public` with its own `publicPassage` object), and proj-fence with `Context.fs.sandboxMode = "workspace-write"` toggled around the fire.

## Expected ledger strings (byte-identical)

- `no registry.json found for <path> - chain pass skipped` (U+2014)
- `observed non-JSON package.json <path> - skipped` (U+2014)
- `update stage dispatched for <dir> (mode=bin, ncu via ncu, built-in default policy)`
- `unreadable registry.json at <path> - chain pass skipped for <path>` (U+2014)
- `governed <path> -> fresh-...` (U+2192)
- `governed <path> -> fresh-9` (the composed message of the transform, U+2192)

## Edge cases

- The non-JSON window adds exactly 2 lines (g2 + non-JSON) and no update stage, which is the passage-closed negative control.
- The keep-list passed to the transform does NOT pin, because the governor closes over its own sections.
- A registry-present no-change manifest keeps the passage closed: no update stage dispatch and no write (the no-flap rule).
- The unreadable registry keeps the passage closed like the missing registry (the no-flap rule) and seeds the Stash at the observed version, with no U-sub-2 advance because no update stage runs.
- The confined fence is rooted at the directory of the manifest, not the workspace.

## Expected count

10 PASS.
