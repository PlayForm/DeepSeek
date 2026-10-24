// Marker - the ESCALATION MARKER detector (ROUTING-ENFORCER-PLUGIN.md section
// 2.2, the task-routing skill's attempts ladder): an agent report that ends
// with `ESCALATION: <concrete reason>` is the ladder's failure signal, so a
// re-dispatch prompt carrying that report must resolve to the escalation rung
// (the planner lane, DeepSeek max, with the artifacts) instead of the cheap
// lane the failed attempt used.
//
// The detector is deliberately exact: the token is `ESCALATION:` (upper case,
// with the colon), the same spelling the delegation spec mandates, so ordinary
// prose about escalation does not trigger a rung. The decision stays
// deterministic - the same spec text always classifies the same way.
/** The marker token (the delegation spec's exact spelling). */
export const MARKER = "ESCALATION:";

export default (Spec: string): boolean => Spec.includes(MARKER);
