# Scheme

- The tab id is `playform-cost`, mounted into the `conversation.view` slot with order 30, locale
  namespace `client-dsh-panel-cost`.
- The host route is `GET /api/playform-cost/session?session=<id>&rows=<n>`, a read-only JSON
  endpoint over the cost ledger at `~/.dsh/cost/ledger.db`.
- The ledger is read-only from this plugin's side: no route in this package writes to the database,
  and the reader opens the file with `readOnly: true` so a query cannot mutate it.
- The browser never reads the ledger directly: it fetches the route, and a failed fetch renders the
  documented state line rather than a broken table.
- The eleven columns are scope, model, files, tokens, cache hit, cache read, input, output, other,
  allocation, and total cost. The timing columns of the harness Statistics panel are absent because
  the ledger does not write them.
