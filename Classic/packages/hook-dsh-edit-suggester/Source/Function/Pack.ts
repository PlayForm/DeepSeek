// Pack - the edit domain's projection of the BUILT-IN pack
// (@playform/lib-dsh-pack): the seven modification families, kept as the
// domain's reference table.
//
// RETIRED FROM THE HOT PATH: nothing imports this module any more. The
// candidates come from the session's own previous tool calls, and a pack is
// only an EXPLICIT user/repo override (Function/Apply resolves it with
// `builtin: false`), so the built-in projection is never a candidate source.
// The file stays because the built-in pack is still the library's documented
// default; this package no longer projects it into the hot path.
import { Builtin, Families } from "@playform/lib-dsh-pack";

export default Families(Builtin, "edit");
