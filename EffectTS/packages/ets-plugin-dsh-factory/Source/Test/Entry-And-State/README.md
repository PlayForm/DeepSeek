# Entry-And-State

What this test verifies.

## Intent

The factory's entry contract and the State builder - the two surfaces every
consumer touches first. `PluginFactory` must be a class extending the cordis
Service base with `static inject = ["fs"]`, registered as
`ctx.pluginFactory` through the Service constructor's `ctx.reflect.provide`,
carrying all 15 service methods. The State builder is the shared machinery
the module leaves call once per apply: it unwraps the volatile config cells
(`mutationTools`), maps the shared config fields (log -> Enabled, logFile ->
Ledger, policyFile -> Policy, exclude -> List), maps the module's own fields
through `options.fields`, probes the `subprocess` service once (P9), tolerates
a bare config, namespaces update-stage Inflight keys (P2's `UpdateKey`), and
registers ONE instance-local `loader/volatile-update` listener (P10) that
refreshes volatile fields in place without a remount. This is the source
suite's sections 1-3, the bare-config/UpdateKey edge checks, and the P10
volatile-refresh section, moved verbatim.

## Scenario

- Group: 1 - the entry contract.
    - Check: "entry: class extends Service, static inject=[fs], registered as
      ctx.pluginFactory" - the default export is a class, the prototype chain
      carries Service, `inject` deep-equals ["fs"], the instance is the value
      provided under "pluginFactory", and `factory.name` is "pluginFactory".
    - Check: "entry: all 15 service methods present" - Append, Match,
      Discover, Parse, ResolvePolicy, Gate, GuardedWrite, Refresh, Continue,
      State, Wire, Attach, Journal, Schema, Seam are all functions.
- Group: 2 - State builder: defaults, cell unwrap, module fields.
    - Check: "State: cell unwrap + shared mappings + module fields + fresh
      structures" - Module/Tool/Ledger/Enabled/List/Policy/PolicyName/Section/
      Strict all mapped; Stash/Inflight/Seams are fresh Maps and Queue is
      empty; the subprocess seam is undefined when the service is absent.
    - Check: "State: P9 probe-once subprocess seam" - with a `subprocess`
      service present, the State probes it exactly once at build.
- Group: 3 - Seam: probe-once caching, never the dead accessor.
    - Check: "Seam: probe-once cache (incl. cached undefined), ctx.get only" -
      the first Seam call hits ctx.get once, the second is served from the
      State's Seams cache, and a missing service caches undefined.
- Group: State tolerates a config missing optional shared fields.
    - Check: "State: missing config fields tolerated (schema guarantees them
      in production)" - Ledger is undefined and Append never throws.
- Group: the live ledger path (additive): the tilde expansion and the missing
    parent directory.
    - Check: "Append: the tilde ledger path expands against $HOME and creates
      its missing parent (~/.dsh/playform)" - with `$HOME` redirected to a
      fresh temp directory that has NO `.dsh` directory and `logFile:
      "~/.dsh/playform/probe.log"`, `State` keeps the raw config path
      (`Ledger` is the unexpanded string), `factory.Append(stDir, "probe
      dir")` expands the path against the home, creates the parent directory,
      and lands the line in `<tempHome>/.dsh/playform/probe.log` matching the
      `[ISO] probe dir` format; the original `$HOME` is restored in a
      `finally`.
- Group: UpdateKey - the namespaced Inflight key for update-stage controllers.
    - Check: "UpdateKey: the namespaced Inflight key (update:<targetKey>)" -
      plain and already-namespaced target keys both map through the
      `update:` prefix.
- Group: P10 volatile refresh (additive): in-place State updates, no remount.
    - Check: "P10 volatile refresh: one instance-local listener, in-place
      field updates (key-array + dotted + nested-object paths), identity
      preserved, unknown/failed paths safe" - the State build registers one
      `loader/volatile-update` listener; a `[["replacement"]]` dispatch
      refreshes the mapped field in place with the State object's identity
      preserved; the dotted-string path does the same; a nested-object cell
      re-reads whole from its top-level key; the shared `log` mapping
      refreshes State.Enabled; unknown/malformed/plain/failed paths are
      ignored or contained (the previous value kept); the dispatch's only
      observable effect is the field update (no activation line, no listener
      churn).

## Fixtures

- The Harness fake ctx (on/emit/effect/get/reflect/fs captures, the ROOT seam
  making the ctx its own root) + the REAL factory class constructed against
  it; one factory instance per folder process.
- A fresh OS tmpdir root (`mkdtempSync`, prefix "factory-smoke-") and the
  ledger path inside it (`ledger.log`).
- `volatileCell = { get: () => ["write","edit"] }` and, for the P10 group, the
  mutable getter cells (`Cell`, `LogCell`, `ObjCell`) whose getters are
  reassigned between dispatches.
- The `loader/volatile-update` listeners are captured through the ctx's `on`
  (the State builder registers on the root scope; the fake ctx is its own
  root) and dispatched directly - the same dispatch shape the loader uses.

## Expected ledger strings (byte-exact)

- `smoke ledger line` (the Append smoke line; the [ISO] stamp and the
  `smoke-flavor: ` logger prefix are asserted in the Ledger-And-Journal
  folder).
- The `bare` append line goes only to the disabled-ledger path (never to a
  file).
- `[ISO] probe dir` (the directory-creation group: the single line written to
  `<tempHome>/.dsh/playform/probe.log`, format-checked as
  `^\[ISO\] probe dir\n$`).

## Edge cases

- Subprocess seam absent -> `State.Subprocess` is undefined; present -> probed
  once.
- Seam's cached undefined: a missing service is cached, not re-probed.
- The P10 negative controls: unknown key paths, malformed paths (a bare
  string, a number, undefined), non-volatile keys (`logFile`), and a throwing
  getter all leave the State's previous value in place without throwing.
- State object identity is preserved across dispatches (`Same === stV`).

## Expected count

9 PASS.
