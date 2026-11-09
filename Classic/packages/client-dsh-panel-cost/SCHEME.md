# Scheme

- The tab id is `playform-cost`, mounted into the `conversation.view` slot with order 30, locale
  namespace `client-dsh-panel-cost`.
- The engine is `@playform/plugin-dsh-cost`: it provides the `cost` service
  (`session(sessionId, rows)` returning the envelope) and exports its contract at
  `@playform/plugin-dsh-cost/service`. This package is UI and transport only.
- The host route is `GET /api/playform-cost/session?session=<id>&rows=<n>`, answered from that
  service. The panel injects `webServer` so the loader orders its row after the harness web server.
- The ledger stays read-only from the engine's side: the service opens it with `readOnly: true` per
  call, and no route in this package writes to the database.
- The browser never reads the ledger directly: it fetches the route, and a failed answer renders the
  state line plus the envelope's own message, so the cause is visible rather than guessed.
- The eleven columns are scope, model, files, tokens, cache hit, cache read, input, output, other,
  allocation, and total cost. The timing columns of the harness Statistics panel are absent because
  the ledger does not write them.
