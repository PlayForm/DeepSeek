# Entry-And-State

This file states what the test verifies.

## Intent

This folder covers the entry contract of the factory and the State builder, the two surfaces that
every consumer touches first.

`PluginFactory` must be a class that extends the cordis Service base with `static inject = ["fs"]`,
and the Service constructor registers it as `ctx.pluginFactory` through `ctx.reflect.provide`, with
all 15 service methods on the instance.

The State builder is the shared machinery that the module leaves call once per apply.

It unwraps the volatile config cells (`mutationTools`), maps the shared config fields (log ->
Enabled, logFile -> Ledger, policyFile -> Policy, exclude -> List), maps the fields of the module
through `options.fields`, probes the `subprocess` service once (P9), tolerates a bare config,
namespaces the update-stage Inflight keys with `UpdateKey` (P2), and registers ONE instance-local
`loader/volatile-update` listener (P10) that refreshes volatile fields in place without a remount.

This folder holds sections 1-3 of the source suite, the bare-config and UpdateKey edge checks, and
the P10 volatile-refresh section, moved verbatim.

## Scenario

- Group: 1 - the entry contract.
    - Check: "entry: class extends Service, static inject=[fs], registered as
      ctx.pluginFactory" - the default export is a class, the prototype chain
      carries Service, `inject` deep-equals ["fs"], the instance is the value
      provided under "pluginFactory", and `factory.name` is "pluginFactory".
    - Check: "entry: all 15 service methods present" - Append, Match,
      Discover, Parse, ResolvePolicy, Gate, GuardedWrite, Refresh, Continue,
      State, Wire, Attach, Journal, Schema, and Seam are all functions.
- Group: 2 - State builder: defaults, cell unwrap, module fields.
    - Check: "State: cell unwrap + shared mappings + module fields + fresh
      structures" - Module/Tool/Ledger/Enabled/List/Policy/PolicyName/Section/
      Strict are all mapped; Stash/Inflight/Seams are fresh Maps and Queue is
      empty; the subprocess seam is undefined when the service is absent.
    - Check: "State: P9 probe-once subprocess seam" - with a `subprocess`
      service present, the State probes it exactly once at build.
- Group: 3 - Seam: probe-once caching, never the dead accessor.
    - Check: "Seam: probe-once cache (incl. cached undefined), ctx.get only" -
      the first Seam call hits ctx.get once, the second is served from the
      Seams cache of the State, and a missing service caches undefined.
- Group: State tolerates a config missing optional shared fields.
    - Check: "State: missing config fields tolerated (schema guarantees them
      in production)" - Ledger is undefined and Append never throws.
- Group: the live ledger path (additive): the tilde expansion at the write site.
    - Check: "Append: the tilde ledger path expands against $HOME (the live
      config shape)" - with `$HOME` redirected to a fresh temp directory and
      `logFile: "~/.dsh/probe.log"`, `State` keeps the raw config path
      (`Ledger` is the unexpanded string), `factory.Append(stTilde, "probe
      tilde")` writes into `<tempHome>/.dsh/probe.log` (the fixture pre-creates
      the `.dsh` directory so this probe isolates the path expansion), and the
      single line of the file matches the `[ISO] probe tilde` ledger format.
- Group: the live ledger path (additive): the missing parent directory.
    - Check: "Append: the ledger append creates its missing parent directory
      (~/.dsh/playform)" - with `$HOME` redirected to a fresh temp directory
      that has NO `.dsh` directory and `logFile:
      "~/.dsh/playform/probe.log"`, `factory.Append(stDir, "probe dir")`
      creates the parent directory and lands the line in
      `<tempHome>/.dsh/playform/probe.log` matching the `[ISO] probe dir`
      format.
- Group: UpdateKey - the namespaced Inflight key for update-stage controllers.
    - Check: "UpdateKey: the namespaced Inflight key (update:<targetKey>)" -
      plain and already-namespaced target keys both map through the
      `update:` prefix.
- Group: P10 volatile refresh (additive): in-place State updates, no remount.
    - Check: "P10 volatile refresh: one instance-local listener, in-place
      field updates (key-array + dotted + nested-object paths), identity
      preserved, unknown/failed paths safe" - the State build registers one
      `loader/volatile-update` listener; a `[["replacement"]]` dispatch
      refreshes the mapped field in place with the identity of the State
      object preserved; the dotted-string path does the same; a nested-object
      cell re-reads whole from its top-level key; the shared `log` mapping
      refreshes State.Enabled; unknown, malformed, plain, and failed paths are
      ignored or contained with the previous value kept; the only observable
      effect of the dispatch is the field update, with no activation line and
      no listener churn.

## Fixtures

- The Harness fake ctx with its on/emit/effect/get/reflect/fs captures and the
  ROOT seam that makes the ctx its own root, plus the REAL factory class
  constructed against it, with one factory instance per folder process.
- A fresh OS tmpdir root from `mkdtempSync` with the prefix "factory-smoke-"
  and the ledger path `ledger.log` inside it.
- `volatileCell = { get: () => ["write","edit"] }` and, for the P10 group, the
  mutable getter cells (`Cell`, `LogCell`, `ObjCell`) whose getters are
  reassigned between dispatches.
- The `loader/volatile-update` listeners are captured through the `on` of the
  ctx, because the State builder registers on the root scope and the fake ctx
  is its own root, and they are dispatched directly in the dispatch shape that
  the loader uses.

## Expected ledger strings (byte-exact)

- `smoke ledger line` is the Append smoke line, and the [ISO] stamp and the
  `smoke-flavor: ` logger prefix are asserted in the Ledger-And-Journal
  folder.
- The `bare` append line goes only to the disabled-ledger path and never to a
  file.
- `[ISO] probe tilde` is the tilde-expansion group line written to
  `<tempHome>/.dsh/probe.log`, format-checked as `^\[ISO\] probe tilde\n$`.
- `[ISO] probe dir` is the directory-creation group line written to
  `<tempHome>/.dsh/playform/probe.log`, format-checked as
  `^\[ISO\] probe dir\n$`.

## Edge cases

- An absent subprocess seam leaves `State.Subprocess` undefined, and a present
  one is probed once.
- Seam caches undefined, so a missing service is not re-probed.
- The P10 negative controls are an unknown key path, malformed paths (a bare
  string, a number, undefined), non-volatile keys (`logFile`), and a throwing
  getter, and each one leaves the previous value of the State in place without
  a throw.
- The identity of the State object survives every dispatch (`Same === stV`).

## Expected count

10 PASS.
