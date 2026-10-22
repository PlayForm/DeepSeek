// Validate - the fail-loud configuration validation at load (the loader
// contract's "a bad config fails loud"): the schema's own type checks run
// first (Schemastery throws on a wrong-typed field), then THESE structural
// rules run on the plain values, each throwing with its exact frozen message.
// Returns the validated plain Configuration the State is built from.
import type Configuration from "@Interface/Config.js";

const UNIT_NAME = /^[a-z][a-z0-9_]*$/;

const LANGUAGES = new Set(["typescript", "javascript", "markdown"]);

const Integer = (Value: unknown, Field: string): number => {
	if (typeof Value !== "number" || !Number.isInteger(Value) || Value <= 0) {
		throw new Error(`invalid config: ${Field} must be a positive integer`);
	}
	return Value;
};

const StringList = (Value: unknown, Field: string): string[] => {
	if (!Array.isArray(Value) || Value.some((Item) => typeof Item !== "string")) {
		throw new Error(`invalid config: ${Field} must be an array of strings`);
	}
	return Value as string[];
};

export default (Raw: Record<string, unknown>): Configuration => {
	const Domain = Raw["domain"];
	if (typeof Domain !== "string" || !UNIT_NAME.test(Domain)) {
		throw new Error(
			"invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/",
		);
	}
	const Languages = Raw["languages"];
	if (
		!Array.isArray(Languages) ||
		Languages.length === 0 ||
		Languages.some((Item) => !LANGUAGES.has(Item as string))
	) {
		throw new Error(
			'invalid config: languages must be a non-empty array of "typescript" | "javascript" | "markdown"',
		);
	}
	const MaxFileBytes = Integer(Raw["maxFileBytes"], "maxFileBytes");
	const MaxNodesPerFile = Integer(Raw["maxNodesPerFile"], "maxNodesPerFile");
	const LimitDefault = Integer(Raw["limitDefault"], "limitDefault");
	const LimitMaximum = Integer(Raw["limitMaximum"], "limitMaximum");
	if (LimitDefault > LimitMaximum) {
		throw new Error("invalid config: limitDefault must not exceed limitMaximum");
	}
	return {
		enabled: Raw["enabled"] === true,
		domain: Domain,
		languages: Languages as Configuration["languages"],
		include: StringList(Raw["include"], "include"),
		exclude: StringList(Raw["exclude"], "exclude"),
		maxFileBytes: MaxFileBytes,
		maxNodesPerFile: MaxNodesPerFile,
		limitDefault: LimitDefault,
		limitMaximum: LimitMaximum,
	};
};
