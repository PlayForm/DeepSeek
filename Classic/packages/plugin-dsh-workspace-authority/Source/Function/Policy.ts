// Policy - the policy table lookup (Function/Policy): the first rule whose
// kind matches the residency record's kind (exactly or "*") wins. No match
// returns undefined - the default disposition "keep" applies (the license
// decides conservatively when unconfigured).
import type PolicyRule from "@Interface/Policy.js";
import type Residency from "@Interface/Residency.js";

export default (Rules: PolicyRule[], Record: Residency): PolicyRule | undefined =>
	Rules.find((Rule) => Rule && (Rule.kind === "*" || Rule.kind === Record.kind));
