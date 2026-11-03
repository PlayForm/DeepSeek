// Defaults - the replay domain's projection of the BUILT-IN pack
// (@playform/ets-lib-dsh-pack): the one Repeat intent, kept as the domain's
// reference table.
//
// RETIRED FROM THE HOT PATH: nothing imports this module any more. The
// candidates come from the recall - the agent's own previous tool calls,
// synthesized into the `Repeat` family per call - and a pack is only an
// EXPLICIT user/repo override (Function/Apply resolves it with
// `builtin: false`), so the built-in projection is never a candidate source.
// The file stays because the built-in pack is still the library's documented
// default; this package no longer projects it into the hot path.
import { Builtin, Families } from "@playform/ets-lib-dsh-pack";

export default Families(Builtin, "replay");
