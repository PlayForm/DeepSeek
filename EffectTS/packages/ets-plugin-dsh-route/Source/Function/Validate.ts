// Validate - the fail-loud validation (the tool-coach precedent): invalid
// configuration throws at load, never silently defaults. The schema already
// guarantees the types; this pass enforces the COMPOSITION contracts the
// schema cannot express:
//
//   - every role's model must be in the policy's allowedModels set;
//   - the allowedModels set must be non-empty;
//   - escalation.max must be >= 0 (0 = the ladder is closed even when
//     enabled);
//   - the keyword table's keys must be the three roles.
import type { KeywordTable, PolicyShape, Role } from "@Interface/Policy.js";

const Fail = (Message: string): never => {
	throw new Error(`plugin-dsh-route: ${Message}`);
};

const ROLES: Role[] = ["explorer", "coder", "planner"];

export default (Policy: PolicyShape, Keywords: KeywordTable): void => {
	if (!Array.isArray(Policy.allowedModels) || Policy.allowedModels.length === 0) {
		Fail("policy.allowedModels must be a non-empty array of model ids");
	}
	for (const Role_ of ROLES) {
		const Row = Policy[Role_];
		if (!Policy.allowedModels.includes(Row.model)) {
			Fail(`policy.${Role_}.model "${Row.model}" is not in policy.allowedModels`);
		}
	}
	if (!(Number(Policy.escalation.max) >= 0)) {
		Fail("policy.escalation.max must be >= 0");
	}
	for (const Key of Object.keys(Keywords)) {
		if (!ROLES.includes(Key as Role)) {
			Fail(`keywords key "${Key}" is not one of "explorer" | "coder" | "planner"`);
		}
	}
};
