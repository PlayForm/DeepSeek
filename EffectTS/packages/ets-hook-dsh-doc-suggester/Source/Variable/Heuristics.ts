// Heuristics - the six PICKABLE heuristic names of the D8 decision model
// (completion spec 03-SUGGESTERS section 2), in the canonical order the
// ledger line and the decision record print them:
//
//   scope   - the call matched the family's path rules;
//   graph   - the graph-distance term (the neutral placeholder here);
//   prior   - the pack's prior for the companion;
//   literal - the literal proof of the companion (the neutral placeholder here);
//   history - the learned per-companion accept rate;
//   accept  - the learned per-family accept rate.
//
// The config field `heuristics` is the ENABLED subset (default: all six, with
// the two placeholders weighted 0 - see Variable/Weights). A name disabled
// there is dropped from the score entirely (its effective weight becomes 0),
// and the decision record keeps the enabled list, so the choice is auditable.
export default ["scope", "graph", "prior", "literal", "history", "accept"] as string[];
