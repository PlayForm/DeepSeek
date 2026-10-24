// Defaults - the test domain's projection of the BUILT-IN pack
// (@playform/ets-lib-dsh-pack): the two test intents, extracted from this
// package so the family has ONE source of truth. The data lives in the
// library's Variable/Builtin; this leaf only selects the `test/` domain (the
// map key prefix).
//
// A resolved workspace pack overrides this projection per call: the Apply
// listener compiles the SAME domain out of the pack the workspace gate
// loaded (memoized per root), so a repo with a `.dsh/pack.yml` (or a
// user-layer pack) gets its own intents and a repo without one gets this
// built-in set.
import { Builtin, Families } from "@playform/ets-lib-dsh-pack";

export default Families(Builtin, "test");
