// Operate - the operation synthesis (plan section 3): the deterministic
// transform per target, per kind. Declarative: the pass-on computes
// find/replace but never executes them. Returns null when the kind makes no
// change for this target (the target is then skipped, with the reason).
import type Operation from "../Interface/Operation.js";

export default (
	Kind: string,
	_Path: string,
	Content: string,
	Params: Record<string, string | number | boolean>,
): Omit<Operation, "path"> | null => {
	switch (Kind) {
		case "version-bump": {
			const Version = Params["version"];
			if (typeof Version !== "string" || Version.length === 0) {
				return null;
			}
			const Matched = /"version"\s*:\s*"([^"]+)"/.exec(Content);
			if (Matched === null || Matched[1] === Version) {
				return null;
			}
			return {
				find: Matched[0],
				replace: `"version": "${Version}"`,
				why: `version ${Matched[1]} -> ${Version}`,
			};
		}
		case "set-field": {
			const Field = Params["field"];
			const Value = Params["value"];
			if (typeof Field !== "string" || Field.length === 0 || typeof Value !== "string") {
				return null;
			}
			const Matched = new RegExp(
				`"${Field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*:\\s*"([^"]+)"`,
			).exec(Content);
			if (Matched === null || Matched[1] === Value) {
				return null;
			}
			return {
				find: Matched[0],
				replace: `"${Field}": "${Value}"`,
				why: `field ${Field}: ${Matched[1]} -> ${Value}`,
			};
		}
		case "replace": {
			const Find = Params["find"];
			const Replace = Params["replace"];
			if (typeof Find !== "string" || Find.length === 0 || typeof Replace !== "string") {
				return null;
			}
			if (!Content.includes(Find) || Find === Replace) {
				return null;
			}
			return {
				find: Find,
				replace: Replace,
				why: `literal replace (${Find.length} bytes)`,
			};
		}
		default:
			// Unknown kind: no operation (the caller records the skip).
			return null;
	}
};
