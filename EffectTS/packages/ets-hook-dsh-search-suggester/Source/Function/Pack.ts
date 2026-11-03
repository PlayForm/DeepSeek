// Pack - RETIRED (the history model). Nothing imports this module, and
// nothing may: the candidates come from the agent's OWN previous tool calls
// (the session/event fold in Function/Apply), never from a literal built-in
// pack. The pack survives ONLY as an explicit user/repo override, resolved per
// call in Function/Apply with `Resolve(root, { home, builtin: false })`.
//
// The file stays (with this header) so the package tree keeps its former
// module, the way `indexPath` stays in the schema: the projection below is the
// search domain of @playform/ets-lib-dsh-pack, kept for reference and for a
// diff against a repo pack. It is NOT a candidate source and must not be
// re-imported by Apply, Dismiss, Seed, or any other module.
import { Builtin, Families } from "@playform/ets-lib-dsh-pack";

export default Families(Builtin, "search");
