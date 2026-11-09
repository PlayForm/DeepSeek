# Serve-Route - the host half's route registration

The suite exercises the host apply through the route the real built plugin apply
actually registered on the fake webServer port, so the suite proves the wired
registration rather than a re-implementation of the handler.

## Scenarios

- S1: the apply registered exactly one route, and its path is the documented
  `/api/playform-cost/session`.
- S2: calling the route's handler with a fake request whose URL carries no
  `session` parameter and a fake response (`writeHead` + `end`, capturing
  into local variables) writes a 200 with
  `content-type: application/json; charset=utf-8`, `cache-control: no-store`
  and a body that is a string produced by JSON.stringify and parses to
  `ok === false`, `code === "session"`, `rows === 200`, `session === null`,
  an empty `calls` list, and a message naming the missing session id. The
  handler never opens the ledger on that path.
- S3: the registration happened through the webServer port and only there:
  the route captured into `Provided.routes` is exactly what the fake
  server's own register counter saw (`Seen.n === 1`), and the handler is a
  function.
- S4: with no webServer (`ctx.get` returns undefined) the host apply does
  not throw and registers nothing.

## Fixtures

The shared Harness supplies the real built Target/Library.js (loaded after
the alias hooks register) and the fake host ctx, whose `ctx.get` answers
`"webServer"` with a capturing fake and undefined for anything else.

S4 uses the harness's deferred posture: `Make({ none: true, defer: true })`
builds the bare ctx without applying, so the check itself drives the apply
inside `doesNotThrow`.

## Known blind spots

- The fake webServer records `register` calls but implements none of the
  real web-server library's semantics: path normalization, duplicate-path
  handling, and disposer teardown are unexercised.
- The handler's failure path (the catch that turns a write error into a
  `logger.warn` line) is not exercised, because the fake response never
  throws.
- The route body is the documented placeholder; the real SQLite ledger
  query a later lane wires in is beyond this suite by design.

## Expected count

4 PASS.
