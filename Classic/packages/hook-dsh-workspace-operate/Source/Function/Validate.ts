// Validate - the fail-loud configuration validation (Function/Validate):
// runs BEFORE the State build so an invalid config throws at load, never
// silently defaults. The rules mirror the Schemastery schema (Variable/
// Config.ts) - the schema defaults are the truth; this is the loud second
// gate for values the schema lets through structurally (e.g. a bad
// volatile cell).
export default (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`operate: ${Message}`);
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
		case !(
			typeof Cell(Raw["maxProposals"]) === "number" &&
			Number.isInteger(Cell(Raw["maxProposals"])) &&
			(Cell(Raw["maxProposals"]) as number) >= 1
		):
			Fail("maxProposals must be an integer >= 1");
			break;
		case !(
			typeof Cell(Raw["limitDefault"]) === "number" &&
			Number.isInteger(Cell(Raw["limitDefault"])) &&
			(Cell(Raw["limitDefault"]) as number) >= 1
		):
			Fail("limitDefault must be an integer >= 1");
			break;
		case !(
			typeof Cell(Raw["limitMaximum"]) === "number" &&
			Number.isInteger(Cell(Raw["limitMaximum"])) &&
			(Cell(Raw["limitMaximum"]) as number) >= 1
		):
			Fail("limitMaximum must be an integer >= 1");
			break;
		default:
	}
};
