# Changelog

All notable changes to this package will be documented in this file.

## 0.0.1

### Added

- The initial release of @playform/ets-dsh-hook: the base of the ets-* group -
  the shared Effect-TS plumbing every `@playform/ets-*` package depends on: the
  runtime wiring (the Context services, the layer graph and the `materialize()`
  runtime assembled for the factory shell), the fiber/stream machinery (the
  Gate transformer and the pure reducers, the Update envelope) and the hook
  contract types (the factory's `Interface/*` structural contracts) - the
  Effect-TS release of the DeepSeek Harness Plugin Family (the base extraction
  per Documentation/Plans/SPLICE-ETS.md §2.3).
