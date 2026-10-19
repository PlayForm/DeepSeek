# Continue

What this test verifies.

## Intent

`Continue` - the detached, contained continuation chain a module's update
engine runs after an fs/observed event: it re-reads the file, resolves the
union keep-list, hands the text to the module's transform, registers the
Inflight entry during the transform, writes through GuardedWrite against the
FRESH stat version, logs the module's message through the ledger, re-emits
fs/observed with the SAME actor, and always removes the Inflight entry. It is
its own folder because it is the largest single behavior in the factory and
every scenario here is async (the sequential fold). This is the source
suite's section 12 (12a-12f) plus the string-message edge check, moved
verbatim.

## Scenario

- Group: 12a - the CHANGE path.
    - Check: "Continue: change path - Inflight lifecycle, guarded write,
      message, same-actor re-emit" - Inflight registered before the transform
      (inflightAtTransform === 1) and removed after settlement; the write
      lands on the target path with the replaceIfVersion intent against the
      fresh-stat version (equal to the observed "v1" in this unraced case);
      the chain stat probe happened (read-only, signal-carrying); the pinned
      dependency dropped its caret, the static one is untouched, untouched
      sections survive serialization; the ledger carries the module message
      composed from the outcome version; the re-emit carries target + fresh
      observation + the same actor.
- Group: 12b - the NO-OP paths.
    - Check: "Continue: no-op paths (null + count 0) silent, Inflight cleaned"
      - a null transform writes nothing and emits nothing; a count===0
      transform is the designed no-op; Inflight still removed.
- Group: 12c - unreadable read.
    - Check: "Continue: unreadable content handed to the transform as null".
- Group: 12d - throw containment.
    - Check: "Continue: throw contained - `<module>: continuation error
      (suppressed)` + Inflight cleaned" - the exact logger line
      `cargo-governor: continuation error (suppressed): boom` and the
      Inflight map cleaned.
- Group: 12e - the keep-list reaches the transform.
    - Check: "Continue: P3 chain-keys union protects chain pins in the
      transform" - the registry's chain key (leftpad) keeps its caret; the
      non-chain dependency is pinned.
- Group: 12f - THE FRESH-VERSION BASIS (the live failure mode).
    - Check: "Continue: fresh-version basis - the file advanced before the
      chain, the write guards the CURRENT version (not the stale observed
      one)" - the raced stat probe returns "current-v9"; the intent's version
      is "current-v9" and never the stale "v-stale"; the raced pass also
      probed the fresh stat.
- Group: Continue - message-as-string logged verbatim.
    - Check: "Continue: string message logged verbatim after the guarded
      write".

## Fixtures

- A fresh OS tmpdir root with the `proj` directory, `registry.json`
  (`{"effectiveLatest":{"leftpad":"1.0.0"}}` - the chain source),
  `global-policy.json` (`{"keep":["g","a"]}`), and `flavor-ledger.log`. NO
  pin-policy.json anywhere (the source suite unlinks both before this
  section so they stay out of the module's keep-list).
- The mini module: the `miniTransform` closure over the mutable `CURRENT`
  binding (verbatim from the source suite, the `->` inside the message
  template is U+2192 at runtime), plus one fresh Harness fake ctx per
  scenario (`files` fixtures, and the overriding `stat` for the raced 12f)
  and a fresh stC/stN/stZ/stU/stT/stK/stRace/stM State with `lastTarget`
  attached.
- The `writes`/`stats`/`emitted`/`loggerLines` captures come from each
  scenario's own fake ctx, so `writes.at(-1)` etc. observe the scenario's
  own call.

## Expected ledger strings (byte-exact)

- `pinned /tmp/.../package.json (1 versions) -> fresh-v2` (the composed
  module message; asserted via `includes("pinned /")` and
  `match(/\u2192 fresh-v2/)` - the separator is U+2192 in the runtime
  string).
- `pinned raced line` / `pinned verbatim line` (the string-message forms,
  asserted via includes).
- `observed non-JSON package.json <path> - skipped` (the mini transform's own
  non-JSON line; the separator is U+2014; not asserted in the moved checks -
  the null path is asserted through the transform's received argument).
- `cargo-governor: continuation error (suppressed): boom` (the exact logger
  line).

## Edge cases

- Null transform, count 0, unreadable content, a throwing transform - all
  contained, all with Inflight cleaned.
- The unraced intent equals the observed version BY DESIGN; the raced intent
  is the fresh stat version, never the stale observed one.

## Expected count

7 PASS.
