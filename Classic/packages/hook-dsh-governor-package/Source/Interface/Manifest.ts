// Manifest — one parsed package.json as the governor sees it: an arbitrary
// JSON object decoded by Function/Decode from the `ctx.fs.readText` content.
// Dependency sections are named by Variable/Section; every other key is the
// author's own (the circuit breaker refuses to let the rewrite change any of
// them). Typed loosely on purpose: the governor amends dependency pins and
// serialises the object back verbatim — it never interprets foreign sections.
export default interface Manifest {
	[Key: string]: unknown;
}
