// The fast path: a PERSISTENT pre-configured home (the dedicated dogfood
// profile per Documentation/Plans/DOGFOOD-TESTING.md Section 2 - created once via
// the wiring-live scaffold, e.g. ~/.dsh-dogfood with the dsh-test profile).
// DSH_WIRING_HOME selects the base; each tree gets its own subhome
// (`classic/`, `ets/`) because both scaffolds build a profile named
// `dsh-test` with different package names (the Classic vs the ets group) -
// one home cannot serve both. The .wiring-ready.json marker makes
// EnsureScratch reuse a subhome as-is (no repack, no reinstall). Without
// DSH_WIRING_HOME the runner builds a throwaway temp scratch per tree (the
// isolation variant) and destroys it at exit - persistent subhomes are
// NEVER destroyed here.
export default process.env.DSH_WIRING_HOME ?? "";
