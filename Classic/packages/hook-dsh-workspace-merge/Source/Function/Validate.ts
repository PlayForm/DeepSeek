// Validate - the fail-loud configuration validation (Function/Validate):
// runs BEFORE the State build so an invalid config throws at load, never
// silently defaults. The rules mirror the Schemastery schema (Variable/
// Config.ts).
export default (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`merge: ${Message}`);
	};
	/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
	const Cell = (Value: unknown): unknown =>
		typeof (Value as { get?: unknown } | null)?.get === "function"
			? (Value as { get: () => unknown }).get()
			: Value;
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !["all-or-nothing", "survivors"].includes(String(Cell(Raw["mode"]))):
			Fail('mode must be "all-or-nothing" or "survivors"');
			break;
		case !(
			typeof Cell(Raw["maxFiles"]) === "number" &&
			Number.isInteger(Cell(Raw["maxFiles"])) &&
			(Cell(Raw["maxFiles"]) as number) >= 1
		):
			Fail("maxFiles must be an integer >= 1");
			break;
		case !(
			typeof Cell(Raw["maxTotalBytes"]) === "number" &&
			Number.isInteger(Cell(Raw["maxTotalBytes"])) &&
			(Cell(Raw["maxTotalBytes"]) as number) >= 1
		):
			Fail("maxTotalBytes must be an integer >= 1");
			break;
		default:
	}
};
