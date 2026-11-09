# Scheme

- The tab id is `playform-cost`, mounted into the `conversation.view` slot with order 30.
- The host route is `GET /api/playform-cost/session`, a read-only JSON endpoint over the cost ledger
  at `~/.dsh/cost/ledger.db`.
- The ledger is read-only from this plugin's side: no route in this package writes to the database,
  and the reader runs outside any transaction the ledger writer owns.
