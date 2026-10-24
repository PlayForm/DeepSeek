// Pack - the search domain's projection of the BUILT-IN pack
// (@playform/lib-dsh-pack): the ten search intents, extracted from this
// package so the family has ONE source of truth. The data lives in the
// library's Variable/Builtin; this leaf only selects the `search/` domain
// (the map key prefix) and keeps the package's State.Pack shape.
//
// A resolved workspace pack overrides this projection per call: the Apply
// listener projects the SAME domain out of the pack the workspace gate
// loaded, so a repo with a `.dsh/pack.yml` (or a user-layer pack) gets its
// own intents and a repo without one gets this built-in set.
import { Builtin, Families } from "@playform/lib-dsh-pack";

export default Families(Builtin, "search");
