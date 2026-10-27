# Continue

This file states what the test verifies.

## Intent

`Continue` is the detached, contained continuation chain that the update engine of a module runs
after an fs/observed event.

It re-reads the file, resolves the union keep-list, hands the text to the transform of the module,
registers the Inflight entry during the transform, writes through GuardedWrite against the FRESH
stat version, logs the message of the module through the ledger, re-emits fs/observed with the SAME
actor, and always removes the Inflight entry.

The behavior has its own folder because it is the largest single behavior in the factory and every
scenario here is async, which the sequential fold causes.

This folder holds section 12 (12a-12f) of the source suite plus the string-message edge check,
moved verbatim.

## Scenario

- Group: 12a - the CHANGE path.
    - Check: "Continue: change path - Inflight lifecycle, guarded write,
      message, same-actor re-emit" - Inflight is registered before the transform
      (inflightAtTransform === 1) and removed after settlement; the write
      lands on the target path with the replaceIfVersion intent against the
      fresh-stat version, equal to the observed "v1" in this unraced case; the
      chain stat probe happened, read-only and signal-carrying; the pinned
      dependency dropped its caret while the static one is untouched and
      untouched sections survive serialization; the ledger carries the module
      message composed from the outcome version; the re-emit carries target +
      fresh observation + the same actor.
- Group: 12b - the NO-OP paths.
    - Check: "Continue: no-op paths (null + count 0) silent, Inflight cleaned"
      - a null transform writes nothing and emits nothing; a count===0
      transform is the designed no-op; Inflight is still removed.
- Group: 12c - unreadable read.
    - Check: "Continue: unreadable content handed to the transform as null".
- Group: 12d - throw containment.
    - Check: "Continue: throw contained - `<module>: continuation error
      (suppressed)` + Inflight cleaned" - the exact logger line
      `cargo-governor: continuation error (suppressed): boom` appears and the
      Inflight map is cleaned.
- Group: 12e - the keep-list reaches the transform.
    - Check: "Continue: P3 chain-keys union protects chain pins in the
      transform" - the chain key of the registry (leftpad) keeps its caret and
      the non-chain dependency is pinned.
- Group: 12f - THE FRESH-VERSION BASIS (the live failure mode).
    - Check: "Continue: fresh-version basis - the file advanced before the
      chain, the write guards the CURRENT version (not the stale observed
      one)" - the raced stat probe returns "current-v9"; the version of the
      intent is "current-v9" and never the stale "v-stale"; the raced pass
      also probed the fresh stat.
- Group: Continue - message-as-string logged verbatim.
    - Check: "Continue: string message logged verbatim after the guarded
      write".

## Fixtures

- A fresh root in the OS tmpdir holds the `proj` directory, `registry.json`
  with `{"effectiveLatest":{"leftpad":"1.0.0"}}` as the chain source,
  `global-policy.json` with `{"keep":["g","a"]}`, and `flavor-ledger.log`.
- No pin-policy.json exists anywhere, because the source suite unlinks both
  before this section so they stay out of the keep-list of the module.
- The mini module supplies the `miniTransform` closure over the mutable
  `CURRENT` binding, verbatim from the source suite, where the `->` inside the
  message template is U+2192 at runtime, plus one fresh Harness fake ctx per
  scenario with `files` fixtures and the overriding `stat` for the raced 12f,
  and a fresh stC/stN/stZ/stU/stT/stK/stRace/stM State with `lastTarget`
  attached.
- The `writes`/`stats`/`emitted`/`loggerLines` captures come from the fake ctx
  of each scenario, so `writes.at(-1)` and its peers observe the call of that
  scenario.

## Expected ledger strings (byte-exact)

- `pinned /tmp/.../package.json (1 versions) -> fresh-v2` is the composed
  module message, asserted through `includes("pinned /")` and
  `match(/\u2192 fresh-v2/)`, where the separator is U+2192 in the runtime
  string.
- `pinned raced line` / `pinned verbatim line` are the string-message forms,
  asserted through includes.
- `observed non-JSON package.json <path> - skipped` is the non-JSON line of
  the mini transform, with U+2014 as the separator; the moved checks do not
  assert it, because the null path is asserted through the received argument
  of the transform.
- `cargo-governor: continuation error (suppressed): boom` is the exact logger
  line.

## Edge cases

- A null transform, count 0, unreadable content, and a throwing transform are
  all contained, all with Inflight cleaned.
- The unraced intent equals the observed version BY DESIGN, while the raced
  intent is the fresh stat version and never the stale observed one.

## Expected count

7 PASS.
