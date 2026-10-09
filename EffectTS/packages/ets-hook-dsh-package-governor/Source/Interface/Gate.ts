// Gate — the PASS DECISION the factory's g1 gate set returns, re-exported
// from the factory's named type exports (the v0.1.1 declaration fix made the
// structural mirror unnecessary). The gate itself logs NOTHING: the caller
// (the module's fs/observed listener) composes its own ledger lines for the
// outcomes it cares about — the `excluded` one (`skipped (excluded) <path>`).
// The reasons enumerate the g1 gate order exactly: target / actor / kind /
// idempotent / basename / excluded (exclusion-first).
export type { Gate } from "@playform/ets-dsh-plugin-factory";
